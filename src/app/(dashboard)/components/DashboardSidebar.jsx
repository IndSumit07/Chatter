"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, Settings, LogOut } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: MessageSquare, label: "Chats", href: "/chats" },
    { icon: Users, label: "Friends", href: "/friends" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const playPop = usePopSound();

    return (
        <aside className="w-72 bg-white border-r-[3px] border-black flex-shrink-0 hidden md:flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-8 border-b-[3px] border-black flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ccfd52] border-2 border-black flex items-center justify-center rounded-xl shadow-[3px_3px_0px_0px_#000000]">
                    <span className="font-black text-lg">C</span>
                </div>
                <span className="text-2xl font-black uppercase tracking-tight">Chatter</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={playPop}
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
                        <Users className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">My Account</p>
                        <p className="text-xs text-gray-500 font-bold truncate">Online</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
