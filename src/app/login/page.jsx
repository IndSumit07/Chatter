"use client";

import Link from "next/link";
import { MessageSquare, Github, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

export default function LoginPage() {
    const playPop = usePopSound();

    return (
        <div className="min-h-screen bg-[#e9e9e9] flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[10%] left-[5%] animate-float-gentle opacity-20">
                <Sparkles className="w-20 h-20 text-[#a881f3]" />
            </div>
            <div className="absolute bottom-[10%] right-[5%] animate-spin-slow opacity-20">
                <Sparkles className="w-32 h-32 text-[#ccfd52]" />
            </div>

            {/* Logo Link */}
            <Link
                href="/"
                onClick={playPop}
                className="flex items-center gap-2 mb-10 group z-10"
            >
                <div className="w-12 h-12 bg-[#ccfd52] border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                    <MessageSquare className="w-7 h-7 text-black" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-black uppercase">Chatter</span>
            </Link>

            {/* Login Card */}
            <div className="w-full max-w-[450px] bg-white border-[3px] border-black rounded-[2.5rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_#000000] z-10 relative">

                <div className="space-y-2 mb-10 text-center">
                    <h1 className="text-4xl font-black text-black">Welcome Back</h1>
                    <p className="text-gray-500 font-bold text-lg italic">Ready to start chatting again?</p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-black text-black uppercase tracking-widest">Password</label>
                            <Link href="#" className="text-xs font-bold text-gray-400 hover:text-black underline underline-offset-4">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={playPop}
                        className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#0f172a] shadow-[6px_6px_0px_0px_#a881f3] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group mt-8"
                    >
                        Login to Account
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-black/5"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm font-black text-gray-400 uppercase tracking-widest">Or continue with</span>
                    </div>
                </div>

                {/* Social Login */}
                <div className="flex justify-center">
                    <button
                        onClick={playPop}
                        className="w-full flex items-center gap-3 bg-white border-2 border-black p-4 rounded-2xl font-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all justify-center"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>

            {/* Footer Link */}
            <p className="mt-10 text-gray-500 font-bold text-lg z-10">
                Don't have an account?{" "}
                <Link
                    href="/signup"
                    onClick={playPop}
                    className="text-black underline underline-offset-8 decoration-[3px] decoration-[#a881f3] hover:decoration-black transition-all"
                >
                    Create one now
                </Link>
            </p>

            {/* Floating Card Detail */}
            <div className="absolute top-[20%] right-[10%] hidden lg:block animate-float-gentle" style={{ animationDelay: '1s' }}>
                <div className="bg-[#ccfd52] border-2 border-black p-4 rounded-2xl rotate-[10deg] shadow-[4px_4px_0px_0px_#000000] font-black text-sm">
                    100% Free Forever ✨
                </div>
            </div>
        </div>
    );
}
