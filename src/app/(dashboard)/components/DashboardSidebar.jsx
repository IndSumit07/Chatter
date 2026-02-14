"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, Settings, LogOut, X } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import { authAPI } from "@/lib/api";
import { useState, useEffect } from "react";

const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: MessageSquare, label: "Chats", href: "/chats" },
    { icon: Users, label: "Friends", href: "/friends" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardSidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();
    const playPop = usePopSound();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = authAPI.getStoredUser();
        if (storedUser) setUser(storedUser);
    }, []);

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-[3px] border-black flex flex-col h-full shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)] md:shadow-none
                transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                md:translate-x-0 md:static md:z-auto
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Sidebar Header */}
                <div className="p-8 border-b-[3px] border-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ccfd52] border-2 border-black flex items-center justify-center rounded-xl shadow-[3px_3px_0px_0px_#000000]">
                            <span className="font-black text-lg text-black">C</span>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tight">Chatter</span>
                    </div>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-transform border-2 border-transparent hover:border-black"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    playPop();
                                    if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 font-bold transition-all duration-200 group ${isActive
                                    ? "bg-[#a881f3] text-white border-black shadow-[4px_4px_0px_0px_#000000] translate-x-[-2px] translate-y-[-2px]"
                                    : "bg-transparent border-transparent text-gray-500 hover:border-black hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_#000000]"
                                    }`}
                            >
                                <item.icon
                                    className={`w-6 h-6 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"
                                        }`}
                                />
                                <span className={isActive ? "text-white" : "text-gray-600 group-hover:text-black"}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer / User Info */}
                <div className="p-6 border-t-[3px] border-black bg-gray-50">
                    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-black overflow-hidden flex items-center justify-center">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-6 h-6 text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate">{user?.fullName || "My Account"}</p>
                            <p className="text-xs text-gray-500 font-bold truncate flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
