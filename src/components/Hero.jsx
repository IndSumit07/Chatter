
"use client";

import { ArrowRight, Play, MessageCircle, Send, Users, Mic, Smile, Hash, Bell, Star, MousePointer2, Music } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

export default function Hero() {
    const playPop = usePopSound();

    return (
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="flex flex-col items-start gap-6 z-10">
                <h1 className="text-5xl md:text-7xl font-semibold text-[#0f172a] leading-[1.1]">
                    Seamless <span className="font-bold">Chat</span>
                    <br />
                    Experience
                    {/* Handdrawn Arrow SVG */}
                    <span className="inline-block relative ml-4 align-middle w-24 h-12">
                        <svg viewBox="0 0 100 50" className="absolute top-1/2 -translate-y-1/2 w-full h-full stroke-black fill-none stroke-2" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                            <path d="M10 25 C 30 10, 50 40, 90 25" />
                            <path d="M85 20 L 90 25 L 85 30" />
                        </svg>
                    </span>
                </h1>

                <p className="text-gray-600 text-lg md:text-xl max-w-lg font-medium leading-relaxed">
                    No More Endless Email Threads or Missed Messages.
                    Experience Communication As It Should Be With Real-time Messaging,
                    Instant Sharing, Crystal Clear Audio & Unlimited Groups.
                    Discover Chat Made Easy.
                </p>

                <div className="flex items-center gap-6 mt-4">
                    <button onClick={playPop} className="px-8 py-3.5 rounded-full bg-[#a881f3] text-white font-bold text-lg shadow-[4px_4px_0px_0px_#000000] border-2 border-black hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none active:translate-y-1 active:translate-x-1">
                        Start Chatting
                    </button>

                    <button onClick={playPop} className="w-14 h-14 rounded-full bg-[#ccfd52] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none active:translate-y-[4px] active:translate-x-[4px]">
                        <Play className="w-6 h-6 fill-black stroke-black ml-1" />
                    </button>
                </div>

                {/* Small floating elements near text */}
                <div onClick={playPop} className="absolute left-[50%] top-[45%] -translate-x-1/2 bg-[#a881f3] rounded-full p-2 border-2 border-black hidden lg:block cursor-pointer hover:scale-110 transition-transform">
                    <Send className="w-6 h-6 text-black fill-white" />
                </div>
            </div>

            {/* Right Column: Visual Composition */}
            <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
                {/* Main Yellow/Green Background - EXACTLY as reference */}
                <div className="absolute inset-0 bg-[#ccfd52] rounded-[3rem] w-[90%] h-[90%] left-[5%] top-[5%] -z-10 border-2 border-black/5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"></div>

                {/* Floating Elements Container - Scaled UP on mobile for better visibility */}
                <div className="relative w-full h-full max-w-[500px] max-h-[500px] scale-[0.85] xs:scale-[0.9] sm:scale-100 origin-center transition-transform">

                    {/* 1. Dotted Selection Box (Top Left) - Target for Cursor */}
                    <div className="absolute top-[8%] left-[2%] w-24 h-24 border-2 border-dashed border-gray-700 rounded-lg opacity-60 animate-pulse"></div>

                    {/* Active Cursor: Moves and 'clicks' the box */}
                    <div className="absolute top-[20%] left-[25%] z-20 animate-cursor-move drop-shadow-lg">
                        <MousePointer2 className="w-12 h-12 fill-[#0f172a] stroke-white stroke-2" />
                    </div>


                    {/* 2. Chat Window (Top Right) - Chatting Simulation */}
                    <div className="absolute top-[15%] right-[-8%] bg-white rounded-2xl border-2 border-black p-2 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-72 z-10 hover:scale-[1.02] transition-transform duration-300 animate-float-gentle">
                        <div className="bg-[#0f172a] rounded-xl p-4 aspect-[16/9] flex flex-col relative overflow-hidden group">

                            {/* Chat Conversation */}
                            <div className="space-y-3 mt-1">
                                {/* Message 1: Incoming */}
                                <div className="flex gap-2 animate-chat-1">
                                    <div className="w-6 h-6 rounded-full bg-red-400 border border-black/20 shrink-0"></div>
                                    <div className="bg-white/10 text-white/90 text-[10px] p-2 rounded-lg rounded-tl-none w-3/4 border border-white/5">
                                        Realtime sync active?
                                    </div>
                                </div>
                                {/* Message 2: Outgoing (Delayed) */}
                                <div className="flex gap-2 flex-row-reverse animate-chat-2">
                                    <div className="w-6 h-6 rounded-full bg-[#ccfd52] border border-black/20 shrink-0"></div>
                                    <div className="bg-[#ccfd52] text-black text-[10px] p-2 rounded-lg rounded-tr-none w-2/3 border border-black/10 font-medium">
                                        Yes, all systems go! 🚀
                                    </div>
                                </div>
                            </div>

                            {/* Live Indicator */}
                            <span className="absolute bottom-1.5 right-3 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse-red"></span>
                                <span className="text-[10px] text-white/50 font-mono">LIVE</span>
                            </span>
                            {/* Progress Bar */}
                            <div className="absolute bottom-3 left-4 right-12 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ccfd52] rounded-full w-[60%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Stats Card (Bottom Left) - Static Floating */}
                    <div className="absolute bottom-[0%] md:bottom-[25%] left-[-5%] md:left-[-2%] bg-white rounded-xl border-2 border-black p-4 w-56 shadow-[-4px_4px_0px_0px_rgba(15,23,42,0.1)] z-10 flex gap-3 items-center animate-float-gentle" style={{ animationDelay: '2s' }}>
                        <div className="w-12 h-14 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                            <span className="text-xl font-bold font-serif text-[#a881f3]">Aa</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="w-full h-8 bg-[#f0fdf4] rounded border border-green-100 flex items-center px-2 gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#ccfd52] flex items-center justify-center">
                                    <Hash className="w-2.5 h-2.5 text-black" />
                                </div>
                                <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
                        </div>
                    </div>

                    {/* 4. Decor Elements */}
                    <div className="absolute top-[-5%] right-[5%] z-30 animate-float-gentle" style={{ animationDelay: '0.5s' }}>
                        <Star className="w-16 h-16 fill-[#a881f3] text-[#0f172a] stroke-2 rotate-[15deg] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                    </div>

                    {/* 5. Music Element with Dancing Waves */}
                    <div className="absolute bottom-[28%] right-[22%] z-20 animate-float-gentle" style={{ animationDuration: '5s' }}>
                        <div className="relative">
                            <div className="w-10 h-10 bg-[#0f1014] rounded-full flex items-center justify-center border-2 border-black">
                                <Mic className="w-5 h-5 text-[#ccfd52]" />
                            </div>
                            {/* Dancing Audio Waves */}
                            <div className="absolute -right-6 -top-2 flex items-end gap-0.5 h-6">
                                <div className="w-1 bg-black rounded-full animate-wave-1 h-2"></div>
                                <div className="w-1 bg-black rounded-full animate-wave-2 h-4"></div>
                                <div className="w-1 bg-black rounded-full animate-wave-3 h-3"></div>
                                <div className="w-1 bg-black rounded-full animate-wave-4 h-5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute bottom-[10%] right-[8%] transform rotate-0 opacity-60">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="w-10 h-[2px] bg-[#0f172a]"></div>
                            <div className="w-10 h-[2px] bg-[#0f172a]"></div>
                            <div className="w-10 h-[2px] bg-[#0f172a] rotate-90 absolute right-5 top-[-20px]"></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Brand Section at Bottom */}
            <div className="col-span-1 lg:col-span-2 mt-12 flex justify-center w-full">
                <div className="bg-[#f0f0f0] border-2 border-black/5 rounded-full px-8 py-4 flex flex-wrap items-center gap-8 md:gap-16 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] max-w-4xl mx-auto">
                    <span className="text-gray-500 font-semibold mr-4">Inspired By</span>

                    {/* Fake Logos using Text/Icons for "same to same" feel without assets */}
                    <div className="flex items-center gap-2 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all font-bold text-xl font-sans tracking-tighter">Slack</div>
                    <div className="flex items-center gap-2 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all font-bold text-xl font-serif">Discord</div>
                    <div className="bg-black text-white px-2 py-1 font-bold text-sm rounded transform -skew-x-6">Zoom</div>
                    <div className="font-bold text-xl flex items-center justify-center w-10 h-10 border-2 border-black rounded-lg">T</div>
                </div>
            </div>
        </section>
    );
}
