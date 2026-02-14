"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import toast from "react-hot-toast";

export default function LoginPage() {
    const playPop = usePopSound();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                toast.success('Welcome back!');
                router.push('/dashboard');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };



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
                <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@company.com"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-black text-black uppercase tracking-widest">Password</label>
                            <Link href="/forgot-password" onClick={playPop} className="text-xs font-bold text-gray-400 hover:text-black underline underline-offset-4">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        onClick={playPop}
                        className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#0f172a] shadow-[6px_6px_0px_0px_#a881f3] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Logging in..." : "Login to Account"}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>


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
