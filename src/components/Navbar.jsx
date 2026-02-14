"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, Bell } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // No backend - always null
  const playPop = usePopSound();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <nav className="relative flex justify-between items-center px-4 md:px-8 py-6 max-w-7xl mx-auto w-full z-50">
      {/* Logo */}
      <div className="text-3xl font-bold tracking-tight text-gray-900 z-50 cursor-pointer" onClick={playPop}>
        Chatter
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1 bg-gray-200/60 backdrop-blur-md p-1.5 rounded-full border border-gray-300/50 shadow-sm">
        <Link href="#" onClick={playPop} className="px-6 py-2 rounded-full bg-[#a881f3] text-white font-medium transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Home</Link>
        <Link href="#" onClick={playPop} className="px-6 py-2 rounded-full text-gray-600 font-medium hover:text-gray-900 hover:bg-white/80 transition-all hover:scale-105">Features</Link>
        <Link href="#" onClick={playPop} className="px-6 py-2 rounded-full text-gray-600 font-medium hover:text-gray-900 hover:bg-white/80 transition-all hover:scale-105">Community</Link>
        <Link href="#" onClick={playPop} className="px-6 py-2 rounded-full text-gray-600 font-medium hover:text-gray-900 hover:bg-white/80 transition-all hover:scale-105">Download</Link>
        <Link href="#" onClick={playPop} className="px-6 py-2 rounded-full text-gray-600 font-medium hover:text-gray-900 hover:bg-white/80 transition-all hover:scale-105">Support</Link>
      </div>

      {/* Desktop CTA / User Profile */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" onClick={playPop} className="px-6 py-2.5 rounded-full bg-[#ccfd52] border-2 border-black text-center text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-[4px] active:translate-x-[4px]">
          Login
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden z-50 p-2 rounded-full bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
        onClick={() => { setIsOpen(!isOpen); playPop(); }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b-2 border-black shadow-xl p-4 flex flex-col gap-4 md:hidden animate-fade-in z-40">
          <Link href="#" onClick={playPop} className="p-3 rounded-xl hover:bg-gray-50 font-medium border border-transparent hover:border-gray-200 transition-all">Home</Link>
          <Link href="#" onClick={playPop} className="p-3 rounded-xl hover:bg-gray-50 font-medium border border-transparent hover:border-gray-200 transition-all">Features</Link>
          <Link href="#" onClick={playPop} className="p-3 rounded-xl hover:bg-gray-50 font-medium border border-transparent hover:border-gray-200 transition-all">Community</Link>
          <Link href="#" onClick={playPop} className="p-3 rounded-xl hover:bg-gray-50 font-medium border border-transparent hover:border-gray-200 transition-all">Download</Link>
          <Link href="#" onClick={playPop} className="p-3 rounded-xl hover:bg-gray-50 font-medium border border-transparent hover:border-gray-200 transition-all">Support</Link>
          <Link href="/login" onClick={playPop} className="w-full py-3 rounded-xl bg-[#ccfd52] border-2 border-black font-bold text-center shadow-[4px_4px_0px_0px_#000000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
