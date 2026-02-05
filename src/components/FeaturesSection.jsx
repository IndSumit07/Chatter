"use client";

import { useState, useEffect } from "react";
import { Play, Type, Image as ImageIcon, MousePointer2, Star, MoveUpRight, Sparkles, MessageSquare, Mic, Video, Phone } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

export default function FeaturesSection() {
    const playPop = usePopSound();
    const [activeTab, setActiveTab] = useState(0); // 0: Text, 1: Voice, 2: Video
    const [simulatedText, setSimulatedText] = useState("");
    const [chatMessages, setChatMessages] = useState([]);

    // Voice Chat State
    const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle', 'recording', 'sent'
    const [recordingTime, setRecordingTime] = useState(0);

    // Cycle through tabs automatically
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 3);
            setSimulatedText("");
            setChatMessages([]);
            setVoiceStatus('idle');
            setRecordingTime(0);
        }, 5000); // Switch every 5 seconds (increased time for typing)

        return () => clearInterval(interval);
    }, []);

    // Typing Effect Logic
    useEffect(() => {
        if (activeTab === 0) {
            const targetText = "Can't wait to see it live! 🔥";
            let currentIndex = 0;
            const typingInterval = setInterval(() => {
                if (currentIndex <= targetText.length) {
                    setSimulatedText(targetText.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    // Send message delay
                    setTimeout(() => {
                        setChatMessages([targetText]);
                        setSimulatedText("");
                    }, 500);
                }
            }, 50); // Typing speed

            return () => clearInterval(typingInterval);
        } else {
            setSimulatedText("");
            setChatMessages([]);
        }
    }, [activeTab]);

    // Voice Recording Logic
    useEffect(() => {
        if (activeTab === 1) {
            setVoiceStatus('recording');
            setRecordingTime(0);

            // Increment timer
            const timerInterval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Finish recording and send after 3 seconds
            const stopRecordingTimeout = setTimeout(() => {
                clearInterval(timerInterval);
                setVoiceStatus('sent');
            }, 3000);

            return () => {
                clearInterval(timerInterval);
                clearTimeout(stopRecordingTimeout);
            };
        } else {
            setVoiceStatus('idle');
            setRecordingTime(0);
        }
    }, [activeTab]);

    return (
        <section className="w-full bg-[#2e1065] py-20 px-4 overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4 z-10 hidden md:block">
                    <h2 className="text-3xl md:text-6xl font-medium text-white tracking-tight">
                        Collaborate With Your Team
                    </h2>
                    <h2 className="text-3xl md:text-6xl font-bold text-white mb-8">
                        Like A Pro
                    </h2>
                </div>

                {/* Main Dashboard Visual with bold borders and increased padding */}
                <div className="relative w-full max-w-5xl aspect-auto md:aspect-video min-h-[600px] md:min-h-0 bg-[#2e1065] rounded-[3.5rem] p-3 md:p-4 shadow-2xl flex flex-col border-2 border-white/10">
                    <div className="bg-white rounded-[3rem] p-6 md:p-10 flex flex-col h-full border-4 border-black/[0.08] relative">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                                <Sparkles className="w-4 h-4 text-black" />
                                <span className="font-bold text-sm">Interactive Demo</span>
                            </div>
                            <div className="flex-1 mx-4 bg-gray-100 h-10 rounded-full border border-gray-200 hidden md:block opacity-50"></div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200"></div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-0">

                            {/* Left Column: Sidebar with 3 Sections */}
                            <div className="md:col-span-3 flex flex-col gap-3 relative h-full">
                                {/* Floating Cursor controlling the interaction */}
                                <div
                                    className="absolute z-50 transition-all duration-700 ease-in-out pointer-events-none"
                                    style={{ top: `${activeTab * 33 + 16}%`, left: '80%' }}
                                >
                                    <div className="relative">
                                        <MousePointer2 className="w-8 h-8 text-black fill-black stroke-white stroke-2 rotate-[-15deg] drop-shadow-lg" />
                                        <div className="absolute top-6 left-4 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">You</div>
                                    </div>
                                </div>

                                {/* Sidebar Buttons */}
                                {[
                                    { id: 0, label: "Text Chat", icon: MessageSquare, color: "bg-[#ccfd52]" },
                                    { id: 1, label: "Voice Note", icon: Mic, color: "bg-[#a881f3]" },
                                    { id: 2, label: "Video Call", icon: Video, color: "bg-[#ff6b6b]" }
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border-2 flex-1 ${activeTab === index ? `${item.color} border-black shadow-[4px_4px_0px_0px_#000000] scale-[1.02] -translate-y-1` : 'bg-gray-50 border-black/10 opacity-60 hover:opacity-100 hover:bg-white hover:border-black/20 hover:shadow-sm'} cursor-pointer`}
                                        onClick={() => { playPop(); setActiveTab(index); }}
                                    >
                                        <div className={`p-2 rounded-lg ${activeTab === index ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`font-bold ${activeTab === index ? 'text-black' : 'text-gray-500'}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column: Main Area Display */}
                            <div className="md:col-span-9 rounded-2xl relative overflow-hidden flex flex-col min-h-[400px] md:min-h-0 h-full border-4 border-black/10 bg-gray-50/50">

                                {/* Text Mode Content */}
                                <div className={`absolute inset-0 rounded-xl overflow-hidden flex flex-col transition-all duration-500 bg-white border-4 border-black/10 ${activeTab === 0 ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 translate-x-4 pointer-events-none'}`}>
                                    {/* Messages Area */}
                                    <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                                        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0"></div>
                                            <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm">
                                                Hey! Did you see the new design updates?
                                            </div>
                                        </div>
                                        <div className="flex gap-3 flex-row-reverse animate-slide-up" style={{ animationDelay: '1.2s' }}>
                                            <div className="w-8 h-8 rounded-full bg-[#ccfd52] shrink-0 border border-black"></div>
                                            <div className="bg-[#ccfd52] text-black border border-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] font-medium text-sm">
                                                Yeah! They look absolutely stunning.
                                            </div>
                                        </div>

                                        {/* Dynamic Sent Message */}
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className="flex gap-3 flex-row-reverse animate-scale-in">
                                                <div className="w-8 h-8 rounded-full bg-[#ccfd52] shrink-0 border border-black"></div>
                                                <div className="bg-[#ccfd52] text-black border border-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] font-medium text-sm">
                                                    {msg}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <div className="bg-gray-100 rounded-full px-4 py-3 flex items-center justify-between border border-gray-200">
                                            <span className={`${simulatedText ? 'text-gray-800' : 'text-gray-400'} text-sm`}>
                                                {simulatedText || "Type a message..."}
                                                {activeTab === 0 && simulatedText.length > 0 && <span className="animate-pulse">|</span>}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${simulatedText.length > 5 ? 'bg-[#ccfd52] text-black' : 'bg-gray-300 text-gray-500'}`}>
                                                <MoveUpRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Voice Mode Content */}
                                <div className={`absolute inset-0 rounded-xl p-8 flex items-center justify-center transition-all duration-500 bg-white border-4 border-black/10 ${activeTab === 1 ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 translate-x-4 pointer-events-none'}`}>

                                    {/* Recording State */}
                                    {voiceStatus === 'recording' && (
                                        <div className="flex flex-col items-center gap-6 animate-scale-in">
                                            <div className="w-24 h-24 rounded-full bg-[#a881f3]/20 flex items-center justify-center relative">
                                                <div className="absolute inset-0 rounded-full bg-[#a881f3]/20 animate-ping"></div>
                                                <div className="w-16 h-16 rounded-full bg-[#a881f3] flex items-center justify-center z-10">
                                                    <Mic className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-1">
                                                <div className="text-lg font-bold">Recording...</div>
                                                <div className="font-mono text-gray-500">0:0{recordingTime}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sent State */}
                                    {voiceStatus === 'sent' && (
                                        <div className="bg-white rounded-2xl border-2 border-black p-6 w-full max-w-md shadow-lg flex items-center gap-4 animate-scale-in">
                                            <div className="w-12 h-12 bg-[#a881f3] rounded-full flex items-center justify-center border-2 border-black">
                                                <Mic className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Voice Note.mp3</span>
                                                    <span>0:03</span>
                                                </div>
                                                <div className="flex items-center gap-1 h-8">
                                                    {[...Array(20)].map((_, i) => (
                                                        <div key={i} className="w-1 bg-[#a881f3] rounded-full animate-wave-dance" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Video Mode Content */}
                                <div className={`absolute inset-0 rounded-xl p-4 transition-all duration-500 bg-white border-4 border-black/10 ${activeTab === 2 ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 translate-x-4 pointer-events-none'}`}>
                                    <div className="w-full h-full bg-gray-900 rounded-xl relative overflow-hidden flex items-center justify-center border border-black/10">
                                        <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                                            <div className="bg-gray-800 rounded-lg relative overflow-hidden border border-white/10">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">JD</div>
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">John Doe</div>
                                            </div>
                                            <div className="bg-gray-800 rounded-lg relative overflow-hidden border-2 border-[#ccfd52] shadow-[0_0_20px_rgba(204,253,82,0.3)]">
                                                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                                    {/* Simulated Camera Feed */}
                                                    <Video className="w-12 h-12 text-gray-500 opacity-50" />
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-[#ccfd52] text-black px-2 py-1 rounded text-xs font-bold">You</div>
                                            </div>
                                        </div>

                                        {/* Call Controls */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 p-2 rounded-full border border-white/10 backdrop-blur-md">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-gray-600"><Mic className="w-4 h-4" /></div>
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-gray-600"><Video className="w-4 h-4" /></div>
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-600"><Phone className="w-4 h-4 rotate-[135deg]" /></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* --- Extra Floating Illustrations & Icons --- */}

                    {/* Bottom Left: Team Avatar Group */}
                    <div className="absolute -bottom-8 -left-4 md:left-8 bg-white py-2 px-4 rounded-full border-2 border-black shadow-2xl flex items-center gap-[-8px] animate-float-gentle z-[60]" style={{ animationDelay: '2.5s' }}>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-red-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">JD</div>
                            <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">AS</div>
                            <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">MK</div>
                        </div>
                        <div className="ml-3 text-xs font-bold text-gray-600">+5</div>
                    </div>

                    {/* Bottom Right: Abstract Squiggle/Shape */}
                    <div className="absolute -bottom-12 -right-10 z-[60] opacity-80 pointer-events-none">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
                            <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" fill="#ccfd52" />
                        </svg>
                    </div>

                </div>

                {/* Background Decor Stars */}
                <Star className="absolute top-20 left-10 w-8 h-8 text-white/30 animate-spin-slow" />
                <Star className="absolute bottom-40 right-10 w-12 h-12 text-[#ccfd52]/40 animate-pulse" />
                <Star className="absolute top-40 right-20 w-6 h-6 text-[#d8b4fe] animate-float-gentle" />

            </div>
        </section>
    );
}
