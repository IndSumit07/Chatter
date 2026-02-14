"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    Users,
    Search,
    Check,
    X,
    Loader2,
    MessageCircle,
    UserMinus,
    Mail,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { authAPI, friendsAPI } from "@/lib/api";
import { usePresence } from "@/contexts/PresenceContext";
import Ably from "ably";

export default function FriendsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState("friends"); // 'friends', 'requests', 'add'
    const { onlineUsers, ablyClient } = usePresence();

    // Friends
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(true);

    // Requests
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Search/Add
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(null);

    useEffect(() => {
        const user = authAPI.getStoredUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setCurrentUser(user);
        loadFriends();
        loadRequests();
    }, [router]);

    const loadFriends = async () => {
        try {
            setFriendsLoading(true);
            const response = await friendsAPI.getFriends();
            if (response.success) {
                setFriends(response.data.friends);
            }
        } catch (error) {
            console.error("Load friends error:", error);
            toast.error("Failed to load friends");
        } finally {
            setFriendsLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            setRequestsLoading(true);
            const response = await friendsAPI.getRequests();
            if (response.success) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            console.error("Load requests error:", error);
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            toast.error("Please enter at least 2 characters");
            return;
        }

        try {
            setSearching(true);
            const response = await friendsAPI.searchUsers(searchQuery);
            if (response.success) {
                setSearchResults(response.data.users);
                if (response.data.users.length === 0) {
                    toast("No users found");
                }
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to search users");
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            setSendingRequest(userId);
            const response = await friendsAPI.sendRequest(userId);
            if (response.success) {
                toast.success("Friend request sent!");

                // Publish real-time notification
                if (ablyClient) {
                    const channel = ablyClient.channels.get(`notifications:${userId}`);
                    channel.publish("new-notification", {
                        type: "friend_request",
                        from: currentUser
                    });
                }

                // Refresh search to update button status
                handleSearch();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Send request error:", error);
            toast.error("Failed to send request");
        } finally {
            setSendingRequest(null);
        }
    };

    const handleRespondToRequest = async (requestId, action) => {
        try {
            const response = await friendsAPI.respondToRequest(requestId, action);
            if (response.success) {
                toast.success(
                    action === "accept"
                        ? "Friend request accepted!"
                        : "Friend request rejected"
                );
                loadRequests();
                loadFriends();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Respond to request error:", error);
            toast.error("Failed to respond to request");
        }
    };

    const handleRemoveFriend = async (userId, userName) => {
        if (!confirm(`Remove ${userName} from your friends?`)) return;

        try {
            const response = await friendsAPI.removeFriend(userId);
            if (response.success) {
                toast.success("Friend removed");
                loadFriends();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Remove friend error:", error);
            toast.error("Failed to remove friend");
        }
    };

    const handleStartChat = (friendId) => {
        router.push(`/chats?userId=${friendId}`);
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black">Friends</h1>
                <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_#000000]">
                    <Users className="w-5 h-5" />
                    <span className="font-black">{friends.length}</span>
                    <span className="text-gray-500 font-bold text-sm">friends</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-[3px] border-black rounded-3xl p-2 shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row gap-2">
                <button
                    onClick={() => setActiveTab("friends")}
                    className={`flex-1 py-3 px-6 rounded-2xl font-black transition-all ${activeTab === "friends"
                        ? "bg-[#a881f3] text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        : "hover:bg-gray-50"
                        }`}
                >
                    Friends ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab("requests")}
                    className={`flex-1 py-3 px-6 rounded-2xl font-black transition-all relative ${activeTab === "requests"
                        ? "bg-[#ccfd52] text-black border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        : "hover:bg-gray-50"
                        }`}
                >
                    Requests ({requests.length})
                    {requests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                            {requests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("add")}
                    className={`flex-1 py-3 px-6 rounded-2xl font-black transition-all ${activeTab === "add"
                        ? "bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_#ccfd52]"
                        : "hover:bg-gray-50"
                        }`}
                >
                    Add Friends
                </button>
            </div>

            {/* Friends List */}
            {activeTab === "friends" && (
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000000]">
                    <h2 className="text-2xl font-black mb-6">Your Friends</h2>

                    {friendsLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-black text-gray-500 mb-2">
                                No friends yet
                            </p>
                            <p className="text-gray-400 font-bold mb-4">
                                Start adding friends to chat with them
                            </p>
                            <button
                                onClick={() => setActiveTab("add")}
                                className="bg-[#ccfd52] text-black px-6 py-3 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                Add Friends
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {friends.map((friend) => {
                                const isOnline = onlineUsers.has(friend._id);
                                return (
                                    <div
                                        key={friend._id}
                                        className="bg-white border-2 border-black rounded-2xl p-4 hover:shadow-[4px_4px_0px_0px_#000000] transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar with online status */}
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                                    {friend.profilePicture ? (
                                                        <img
                                                            src={friend.profilePicture}
                                                            alt={friend.fullName}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white font-black text-xl">
                                                            {friend.fullName[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Online indicator */}
                                                {isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg truncate">
                                                    {friend.fullName}
                                                </h3>
                                                <p className="text-sm text-gray-500 font-bold truncate">
                                                    @{friend.username}
                                                </p>
                                                <p className="text-xs text-gray-400 font-bold mt-1">
                                                    {isOnline ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            Online
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Offline</span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleStartChat(friend._id)}
                                                    className="bg-[#ccfd52] text-black p-2 rounded-xl border-2 border-black hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                                                    title="Start chat"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveFriend(friend._id, friend.fullName)
                                                    }
                                                    className="bg-red-100 text-red-600 p-2 rounded-xl border-2 border-black hover:bg-red-200 transition-all"
                                                    title="Remove friend"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Friend Requests */}
            {activeTab === "requests" && (
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000000]">
                    <h2 className="text-2xl font-black mb-6">Friend Requests</h2>

                    {requestsLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-black text-gray-500">
                                No pending requests
                            </p>
                            <p className="text-gray-400 font-bold mt-2">
                                You'll see friend requests here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white border-2 border-black rounded-2xl p-4 hover:shadow-[4px_4px_0px_0px_#000000] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                            {request.from.profilePicture ? (
                                                <img
                                                    src={request.from.profilePicture}
                                                    alt={request.from.fullName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-black text-xl">
                                                    {request.from.fullName[0]}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-lg truncate">
                                                {request.from.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-bold truncate">
                                                @{request.from.username}
                                            </p>
                                            {request.message && (
                                                <p className="text-sm text-gray-600 font-bold mt-1">
                                                    "{request.message}"
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleRespondToRequest(request._id, "accept")
                                                }
                                                className="bg-[#ccfd52] text-black px-4 py-2 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRespondToRequest(request._id, "reject")
                                                }
                                                className="bg-gray-200 text-black px-4 py-2 rounded-xl font-black border-2 border-black hover:bg-gray-300 transition-all flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Friends */}
            {activeTab === "add" && (
                <div className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000000]">
                    <h2 className="text-2xl font-black mb-6">Add New Friends</h2>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search by username or email..."
                                    className="w-full bg-gray-50 border-2 border-black rounded-2xl pl-12 pr-4 py-4 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={searching || !searchQuery.trim()}
                                className="bg-[#a881f3] text-white px-8 py-4 rounded-2xl font-black border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {searching ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.map((user) => {
                                const relationship = user.relationship;
                                const isFriend = relationship?.status === "accepted";
                                const isPending =
                                    relationship?.status === "pending" &&
                                    relationship?.direction === "sent";
                                const hasRequest =
                                    relationship?.status === "pending" &&
                                    relationship?.direction === "received";

                                return (
                                    <div
                                        key={user._id}
                                        className="bg-white border-2 border-black rounded-2xl p-4 hover:shadow-[4px_4px_0px_0px_#000000] transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                                {user.profilePicture ? (
                                                    <img
                                                        src={user.profilePicture}
                                                        alt={user.fullName}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-black">
                                                        {user.fullName[0]}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black truncate">{user.fullName}</h3>
                                                <p className="text-sm text-gray-500 font-bold truncate">
                                                    @{user.username}
                                                </p>
                                            </div>

                                            {isFriend ? (
                                                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-black text-sm border-2 border-green-500">
                                                    Friends
                                                </span>
                                            ) : isPending ? (
                                                <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-black text-sm border-2 border-gray-300">
                                                    Pending
                                                </span>
                                            ) : hasRequest ? (
                                                <button
                                                    onClick={() => setActiveTab("requests")}
                                                    className="bg-[#ccfd52] text-black px-4 py-2 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all"
                                                >
                                                    View Request
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSendRequest(user._id)}
                                                    disabled={sendingRequest === user._id}
                                                    className="bg-[#a881f3] text-white px-4 py-2 rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {sendingRequest === user._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                    Add Friend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-bold">
                                Search for users by username or email
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
