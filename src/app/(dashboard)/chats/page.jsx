"use client";

import { Suspense } from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    MessageCircle,
    Send,
    User,
    Search,
    Loader2,
    Check,
    CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI, chatAPI, friendsAPI } from "@/lib/api";
import Ably from "ably";
import { getChatRoomId } from "@/lib/ably";
import { usePresence } from "@/contexts/PresenceContext";

function ChatsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedUserId = searchParams.get("userId");

    const [currentUser, setCurrentUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { onlineUsers } = usePresence(); // Destructure onlineUsers from usePresence

    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const ablyRef = useRef(null);
    const channelRef = useRef(null);

    // Initialize
    useEffect(() => {
        const user = authAPI.getStoredUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setCurrentUser(user);
        loadFriends();
        loadConversations();
    }, [router]);

    // Initialize Ably
    useEffect(() => {
        if (!currentUser) return;

        // Initialize Ably client with full API key for client-side
        const apiKey = process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY;
        if (!apiKey) {
            console.warn("⚠️ Ably not configured. Please add NEXT_PUBLIC_ABLY_PUBLIC_KEY to .env.local");
            return;
        }

        try {
            ablyRef.current = new Ably.Realtime({
                key: apiKey,
                clientId: currentUser.id
            });

            ablyRef.current.connection.on("connected", () => {
                console.log("✅ Connected to Ably - Real-time chat is ACTIVE!");
            });

            ablyRef.current.connection.on("disconnected", () => {
                console.warn("⚠️ Disconnected from Ably");
            });

            ablyRef.current.connection.on("failed", (error) => {
                console.error("❌ Ably connection failed:", error);
                toast.error("Real-time connection failed. Messages may be delayed.");
            });

            ablyRef.current.connection.on("suspended", () => {
                console.warn("⚠️ Ably connection suspended");
                toast.error("Connection lost. Reconnecting...");
            });
        } catch (error) {
            console.error("Error initializing Ably:", error);
            toast.error("Failed to initialize real-time chat");
        }

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
            if (ablyRef.current) {
                ablyRef.current.close();
            }
        };
    }, [currentUser]);

    // Subscribe to chat channel when conversation is selected
    useEffect(() => {
        if (!selectedConversation || !ablyRef.current || !currentUser) return;

        const chatRoomId = getChatRoomId(currentUser.id, selectedConversation.user._id);
        console.log(`📡 Subscribing to channel: ${chatRoomId}`);

        // Unsubscribe from previous channel
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }

        // Subscribe to new channel
        channelRef.current = ablyRef.current.channels.get(chatRoomId);

        channelRef.current.subscribe("new-message", (message) => {
            const newMsg = message.data;
            console.log("📨 Received real-time message:", newMsg);

            // Only add if from other user (we already added our own messages locally)
            if (newMsg.senderId._id !== currentUser.id) {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === newMsg._id)) {
                        return prev;
                    }
                    return [...prev, newMsg];
                });

                // Auto-scroll to new message
                scrollToBottom();

                // Mark as read if we're viewing the chat
                chatAPI.markAsRead(chatRoomId);
            }
        });

        channelRef.current.subscribe("message-edited", (message) => {
            const editedMsg = message.data;
            console.log("✏️ Message edited:", editedMsg);
            setMessages((prev) =>
                prev.map((m) => (m._id === editedMsg._id ? editedMsg : m))
            );
        });

        channelRef.current.subscribe("message-deleted", (message) => {
            const { messageId, userId } = message.data;
            console.log("🗑️ Message deleted:", messageId);
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
        });

        channelRef.current.subscribe("message-reacted", (message) => {
            const reactedMsg = message.data;
            console.log("😊 Reaction added/removed:", reactedMsg);
            setMessages((prev) =>
                prev.map((m) => (m._id === reactedMsg._id ? reactedMsg : m))
            );
        });

        // Mark messages as read when opening conversation
        chatAPI.markAsRead(chatRoomId);

        return () => {
            if (channelRef.current) {
                console.log(`📡 Unsubscribing from channel: ${chatRoomId}`);
                channelRef.current.unsubscribe();
            }
        };
    }, [selectedConversation, currentUser]);

    // Load conversations
    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations();
            if (response.success) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error("Load conversations error:", error);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    // Load friends list
    const loadFriends = async () => {
        try {
            const response = await friendsAPI.getFriends();
            if (response.success) {
                setFriends(response.data.friends);
            }
        } catch (error) {
            console.error("Load friends error:", error);
        }
    };

    // Initialize Ably Presence for online status
    const initializePresence = (user) => {
        const publicKey = process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY;
        if (!publicKey || publicKey === "your-ably-public-key") {
            return;
        }

        try {
            if (!ablyRef.current) return;

            const presenceChannel = ablyRef.current.channels.get("presence:global");
            presenceChannel.presence.enter({ userId: user.id, name: user.fullName });

            presenceChannel.presence.subscribe("enter", (member) => {
                setOnlineUsers((prev) => new Set(prev).add(member.data.userId));
            });

            presenceChannel.presence.subscribe("leave", (member) => {
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(member.data.userId);
                    return newSet;
                });
            });

            presenceChannel.presence.get((err, members) => {
                if (!err) {
                    const userIds = members.map((m) => m.data.userId);
                    setOnlineUsers(new Set(userIds));
                }
            });

            presenceChannelRef.current = presenceChannel;
        } catch (error) {
            console.error("Presence initialization error:", error);
        }
    };

    // Load messages for selected conversation
    const loadMessages = async (userId) => {
        try {
            const response = await chatAPI.getMessages(userId);
            if (response.success) {
                setMessages(response.data.messages);
                scrollToBottom();
            }
        } catch (error) {
            console.error("Load messages error:", error);
            toast.error("Failed to load messages");
        }
    };

    // Combine friends and conversations for display
    const getCombinedList = () => {
        const combined = [];
        const conversationUserIds = new Set(conversations.map(c => c.user._id));

        // Add existing conversations first
        combined.push(...conversations);

        // Add friends who don't have conversations yet
        friends.forEach(friend => {
            if (!conversationUserIds.has(friend._id)) {
                combined.push({
                    user: friend,
                    lastMessage: null,
                    chatRoomId: getChatRoomId(currentUser.id, friend._id),
                    unreadCount: 0,
                });
            }
        });

        return combined;
    };

    // Select conversation (updated to handle both friends and conversations)
    const selectConversation = (item) => {
        setSelectedConversation(item);
        loadMessages(item.user._id);
        // Update URL without refreshing
        router.replace(`/chats?userId=${item.user._id}`, { shallow: true });
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage("");
        setSending(true);

        try {
            const response = await chatAPI.sendMessage(
                selectedConversation.user._id,
                messageContent
            );

            if (response.success) {
                const sentMessage = response.data.message;

                // Add message to local state
                setMessages((prev) => [...prev, sentMessage]);

                // Publish to Ably channel
                if (channelRef.current) {
                    channelRef.current.publish("new-message", sentMessage);
                }

                // Publish real-time notification to recipient
                if (ablyRef.current) {
                    const notifyChannel = ablyRef.current.channels.get(`notifications:${selectedConversation.user._id}`);
                    notifyChannel.publish("new-notification", {
                        type: "new_message",
                        from: currentUser,
                        message: sentMessage
                    });
                }

                scrollToBottom();
            } else {
                toast.error(response.message || "Failed to send message");
                setNewMessage(messageContent); // Restore message
            }
        } catch (error) {
            console.error("Send message error:", error);
            toast.error("Failed to send message");
            setNewMessage(messageContent); // Restore message
        } finally {
            setSending(false);
            // Keep input focused for quick messaging - use setTimeout to wait for disabled state to clear
            setTimeout(() => {
                messageInputRef.current?.focus();
            }, 10);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Get combined list and filter by search
    const combinedList = currentUser ? getCombinedList() : [];
    const filteredConversations = combinedList.filter((conv) =>
        conv.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex gap-4">
            {/* Conversations Sidebar */}
            <div className="w-80 bg-white border-[3px] border-black rounded-3xl shadow-[8px_8px_0px_0px_#000000] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b-[3px] border-black">
                    <h2 className="text-2xl font-black mb-4">Messages</h2>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full bg-gray-50 border-2 border-black rounded-xl pl-10 pr-3 py-2 font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_#a881f3] transition-all"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-400 font-bold">No conversations yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Go to Friends to start chatting
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.user._id}
                                onClick={() => selectConversation(conv)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-200 ${selectedConversation?.user._id === conv.user._id
                                    ? "bg-[#ccfd52] hover:bg-[#ccfd52]"
                                    : ""
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                        {conv.user.profilePicture ? (
                                            <img
                                                src={conv.user.profilePicture}
                                                alt={conv.user.fullName}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-black text-lg">
                                                {conv.user.fullName[0]}
                                            </span>
                                        )}
                                    </div>
                                    {onlineUsers.has(conv.user._id) && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                                    )}
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-black text-sm truncate">
                                            {conv.user.fullName}
                                        </h3>
                                        {conv.lastMessage && (
                                            <span className="text-xs text-gray-500 font-bold">
                                                {formatTime(conv.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {conv.lastMessage ? (
                                            <>
                                                <p className="text-sm text-gray-600 font-bold truncate">
                                                    {conv.lastMessage.isMine && "You: "}
                                                    {conv.lastMessage.content}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-[#a881f3] text-white text-xs font-black px-2 py-0.5 rounded-full ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400 font-bold italic">
                                                Click to start chatting
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white border-[3px] border-black rounded-3xl shadow-[8px_8px_0px_0px_#000000] flex flex-col overflow-hidden">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b-[3px] border-black flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center">
                                {selectedConversation.user.profilePicture ? (
                                    <img
                                        src={selectedConversation.user.profilePicture}
                                        alt={selectedConversation.user.fullName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-black">
                                        {selectedConversation.user.fullName[0]}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-black leading-none">
                                    {selectedConversation.user.fullName}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {onlineUsers.has(selectedConversation.user._id) ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                                            <span className="text-sm font-black text-black/60">Online</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 font-bold">
                                            @{selectedConversation.user.username}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {messages.map((msg) => {
                                const isMine = msg.senderId._id === currentUser.id;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] ${isMine
                                                ? "bg-[#a881f3] text-white"
                                                : "bg-white border-2 border-black"
                                                } rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000000]`}
                                        >
                                            <p className="font-bold break-all">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span
                                                    className={`text-xs font-bold ${isMine ? "text-white/70" : "text-gray-500"
                                                        }`}
                                                >
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                {isMine && (
                                                    <div className="text-white/70">
                                                        {msg.readBy?.includes(selectedConversation.user._id) ? (
                                                            <CheckCheck className="w-3 h-3" />
                                                        ) : (
                                                            <Check className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-6 border-t-[3px] border-black bg-white"
                        >
                            <div className="flex gap-3">
                                <input
                                    ref={messageInputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border-2 border-black rounded-2xl px-4 py-3 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-[#ccfd52] text-black px-6 py-3 rounded-2xl font-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                        <div>
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-2xl font-black mb-2">Select a conversation</h3>
                            <p className="text-gray-500 font-bold">
                                Choose a conversation from the list to start chatting
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}

export default function ChatsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <ChatsContent />
        </Suspense>
    );
}
