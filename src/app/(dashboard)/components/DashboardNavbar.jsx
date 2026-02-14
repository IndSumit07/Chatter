"use client";

import { Bell, Search, MessageCircle, UserPlus, X, Settings, LogOut, ChevronDown, Menu } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import { useState, useEffect, useRef } from "react";
import { authAPI, chatAPI, friendsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePresence } from "@/contexts/PresenceContext";
import toast from "react-hot-toast";

export default function DashboardNavbar({ onMenuClick }) {
    const playPop = usePopSound();
    const router = useRouter();
    const { ablyClient } = usePresence();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Notifications state
    const [pendingRequests, setPendingRequests] = useState([]);
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = authAPI.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            fetchNotifications();
        }

        // Close dropdowns when clicking outside
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Real-time subscription
    useEffect(() => {
        if (!ablyClient || !user) return;

        const channel = ablyClient.channels.get(`notifications:${user.id || user._id}`);

        const handleNotification = (message) => {
            console.log("🔔 Received notification:", message.data);
            playPop();
            fetchNotifications(); // Refresh data immediately
        };

        channel.subscribe("new-notification", handleNotification);
        channel.subscribe("refresh", handleNotification);

        return () => {
            channel.unsubscribe();
        };
    }, [ablyClient, user]);

    const fetchNotifications = async () => {
        try {
            // Don't show loading spinner on refresh to keep UI stable
            const [conversationsRes, requestsRes] = await Promise.all([
                chatAPI.getConversations(),
                friendsAPI.getRequests()
            ]);

            if (conversationsRes.success) {
                const unread = conversationsRes.data.conversations.filter(c => c.unreadCount > 0);
                setUnreadConversations(unread);
            }

            if (requestsRes.success) {
                setPendingRequests(requestsRes.data.requests);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const totalNotifications = pendingRequests.length + unreadConversations.length;

    return (
        <header className="bg-white border-b-[3px] border-black h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
            {/* Mobile Menu & Title */}
            <div className="flex items-center gap-3 md:hidden">
                <button
                    onClick={onMenuClick}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-transform"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="font-black text-xl uppercase tracking-tighter">Chatter</div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center w-96">
                <div className="relative w-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-gray-100 border-2 border-transparent rounded-xl py-2.5 pl-12 pr-4 font-bold focus:bg-white focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_#000000] transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 md:gap-6">

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) fetchNotifications(); // Refresh on open
                        }}
                        className="relative w-10 h-10 rounded-xl border-2 border-transparent hover:border-black hover:bg-gray-100 flex items-center justify-center transition-all group"
                    >
                        <Bell className={`w-6 h-6 text-gray-700 group-hover:rotate-12 transition-transform ${showNotifications ? "fill-black" : ""}`} />
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                                {totalNotifications > 9 ? "9+" : totalNotifications}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center">
                                <h3 className="font-black text-sm uppercase tracking-wide">Notifications</h3>
                                <div className="flex gap-2">
                                    <span className="bg-[#ccfd52] px-2 py-0.5 rounded-md text-xs font-bold border border-black shadow-[2px_2px_0px_0px_#000000]">
                                        {totalNotifications} New
                                    </span>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-400 font-bold animate-pulse">Loading...</div>
                                ) : totalNotifications === 0 ? (
                                    <div className="p-8 text-center text-gray-400 font-bold text-sm flex flex-col items-center">
                                        <Bell className="w-8 h-8 mb-2 opacity-50" />
                                        No new notifications
                                    </div>
                                ) : (
                                    <div className="divide-y-2 divide-gray-100">
                                        {/* Friend Requests */}
                                        {pendingRequests.map(request => (
                                            <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 items-start bg-[#ccfd52]/10">
                                                <div className="w-10 h-10 bg-[#ccfd52] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                                    <UserPlus className="w-5 h-5 text-black" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">
                                                        <span className="text-black">{request.from.fullName}</span> sent you a friend request
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-bold mt-1">@{request.from.username}</p>

                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => router.push("/friends?tab=requests")}
                                                            className="flex-1 bg-black text-white text-xs font-bold py-1.5 rounded-lg active:scale-95 transition-transform"
                                                        >
                                                            View Request
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Unread Chats */}
                                        {unreadConversations.map(conv => (
                                            <div
                                                key={conv.chatRoomId}
                                                onClick={() => router.push(`/chats?userId=${conv.user._id}`)}
                                                className="p-4 hover:bg-gray-50 transition-colors flex gap-3 items-center cursor-pointer group"
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-[#a881f3] border-2 border-black rounded-full flex items-center justify-center shrink-0">
                                                        {conv.user.profilePicture ? (
                                                            <img src={conv.user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-white font-black">{conv.user.fullName[0]}</span>
                                                        )}
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                                                        <span className="text-[9px] text-white font-black">{conv.unreadCount}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-black truncate">{conv.user.fullName}</p>
                                                    <p className="text-xs text-gray-500 font-medium truncate group-hover:text-black transition-colors">
                                                        {conv.lastMessage.content}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-bold text-[#a881f3]">Chat</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                    <button
                        className="flex items-center gap-3 pl-4 border-l-2 border-gray-200 cursor-pointer group transition-all"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                        <div className="text-right hidden md:block">
                            <p className="font-black text-sm leading-none group-hover:text-[#a881f3] transition-colors">
                                {user?.fullName || "Loading..."}
                            </p>
                            <p className="text-xs font-bold text-gray-400">@{user?.username || "user"}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#a881f3] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center group-hover:translate-x-px group-hover:translate-y-px group-hover:shadow-none transition-all overflow-hidden relative">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-white text-lg">
                                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showUserDropdown && (
                        <div className="absolute right-0 mt-3 w-56 bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="p-4 border-b-2 border-gray-100">
                                <p className="font-black text-black">{user?.fullName}</p>
                                <p className="text-xs font-bold text-gray-500 truncate">@{user?.username}</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => {
                                        router.push("/settings");
                                        setShowUserDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
