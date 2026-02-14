"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePopSound } from "@/hooks/usePopSound";
import {
    ArrowUpRight,
    MessageSquare,
    Users,
    Clock,
    Star,
    Loader2,
    MessageCircle,
    UserPlus,
    Mail
} from "lucide-react";
import { authAPI, chatAPI, friendsAPI } from "@/lib/api";
import { usePresence } from "@/contexts/PresenceContext";
import toast from "react-hot-toast";

export default function DashboardHome() {
    const playPop = usePopSound();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { onlineUsers } = usePresence();

    // Stats
    const [stats, setStats] = useState({
        totalChats: 0,
        totalFriends: 0,
        pendingRequests: 0,
        unreadMessages: 0
    });

    // Data lists
    const [recentActivity, setRecentActivity] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const user = authAPI.getStoredUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setCurrentUser(user);
        loadDashboardData(user);
    }, [router]);

    const loadDashboardData = async (user) => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [conversationsRes, friendsRes, requestsRes] = await Promise.all([
                chatAPI.getConversations(),
                friendsAPI.getFriends(),
                friendsAPI.getRequests()
            ]);

            // Process Conversations
            let totalChats = 0;
            let unreadMessages = 0;
            let activity = [];

            if (conversationsRes.success) {
                const conversations = conversationsRes.data.conversations;
                totalChats = conversations.length;
                unreadMessages = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
                activity = conversations.slice(0, 5); // Top 5 recent chats
            }

            // Process Friends
            let totalFriends = 0;
            let friendsList = [];
            if (friendsRes.success) {
                friendsList = friendsRes.data.friends;
                totalFriends = friendsList.length;
                setFriends(friendsList);
            }

            // Process Requests
            let pendingRequests = 0;
            if (requestsRes.success) {
                pendingRequests = requestsRes.data.requests.length;
            }

            setStats({
                totalChats,
                totalFriends,
                pendingRequests,
                unreadMessages
            });

            setRecentActivity(activity);

        } catch (error) {
            console.error("Error loading dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = () => {
        playPop();
        router.push("/chats");
    };

    const handleViewFriends = () => {
        router.push("/friends");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // Filter friends to get online friends list
    const onlineFriendsList = friends.filter(friend => onlineUsers.has(friend._id));

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-black mb-2">Welcome back, {currentUser?.fullName}!</h1>
                    <p className="text-gray-500 font-bold">Here's what is happening today.</p>
                </div>
                <button
                    onClick={handleStartChat}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold shadow-[4px_4px_0px_0px_#a881f3] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 w-fit"
                >
                    Start New Chat
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Chats", value: stats.totalChats, icon: MessageSquare, color: "bg-[#ccfd52]" },
                    { label: "Friends", value: stats.totalFriends, icon: Users, color: "bg-[#a881f3]" },
                    { label: "Friend Requests", value: stats.pendingRequests, icon: UserPlus, color: "bg-[#f3a881]" },
                    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "bg-[#81f3a8]" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[-2px] transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl border-2 border-black ${stat.color} shadow-[2px_2px_0px_0px_#000000]`}>
                                <stat.icon className="w-6 h-6 text-black" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-black text-black mb-1">{stat.value}</h3>
                        <p className="text-gray-500 font-bold text-sm tracking-wide uppercase">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-black">Recent Conversations</h2>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((conversation, i) => (
                                <div
                                    key={i}
                                    onClick={() => router.push(`/chats?userId=${conversation.user._id}`)}
                                    className="group flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#a881f3] border-2 border-black flex items-center justify-center shrink-0">
                                        {conversation.user.profilePicture ? (
                                            <img
                                                src={conversation.user.profilePicture}
                                                alt={conversation.user.fullName}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-black text-lg">
                                                {conversation.user.fullName[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg truncate">{conversation.user.fullName}</h4>
                                        <p className="text-gray-500 font-medium text-sm truncate">
                                            {conversation.lastMessage.isMine && "You: "}
                                            {conversation.lastMessage.content}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-bold text-gray-400">
                                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-[#a881f3] text-white text-xs font-black px-2 py-0.5 rounded-full">
                                                {conversation.unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 font-bold">No recent conversations</p>
                                <button
                                    onClick={handleStartChat}
                                    className="mt-4 text-[#a881f3] font-black hover:underline"
                                >
                                    Start a new chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel (Active Users) */}
                <div className="bg-[#ccfd52] border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000000]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-black uppercase tracking-wider">Online Friends</h3>
                        <span className="bg-black text-[#ccfd52] px-2 py-1 rounded-lg text-xs font-black">
                            {onlineFriendsList.length}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {onlineFriendsList.length > 0 ? (
                            onlineFriendsList.slice(0, 5).map((friend, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center overflow-hidden">
                                            {friend.profilePicture ? (
                                                <img
                                                    src={friend.profilePicture}
                                                    alt={friend.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-black text-black text-sm">{friend.fullName[0]}</span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-black truncate">{friend.fullName}</p>
                                        <p className="text-xs text-black/60 font-bold truncate">@{friend.username}</p>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/chats?userId=${friend._id}`)}
                                        className="bg-black text-white p-1.5 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-black/60 font-medium text-center py-4">No friends online right now</p>
                        )}
                    </div>

                    <button
                        onClick={handleViewFriends}
                        className="w-full mt-8 bg-black text-white py-3 rounded-xl font-bold shadow-[4px_4px_0px_0px_white] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                    >
                        View All Friends
                    </button>
                </div>
            </div>
        </div>
    );
}
