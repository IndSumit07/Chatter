"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Lock, ArrowRight, Sparkles } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const playPop = usePopSound();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            toast.error("Invalid reset link");
            router.push("/forgot-password");
        }
    }, [searchParams, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Password reset successful!');
                router.push('/login');
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
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
            <Link href="/" onClick={playPop} className="flex items-center gap-2 mb-10 group z-10">
                <div className="w-12 h-12 bg-[#ccfd52] border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                    <MessageSquare className="w-7 h-7 text-black" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-black uppercase">Chatter</span>
            </Link>

            {/* Card */}
            <div className="w-full max-w-[450px] bg-white border-[3px] border-black rounded-[2.5rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_#000000] z-10 relative">
                <div className="space-y-2 mb-10 text-center">
                    <h1 className="text-4xl font-black text-black">Reset Password</h1>
                    <p className="text-gray-500 font-bold text-lg italic">Enter your new password below.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-black uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-black uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={playPop}
                        className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#0f172a] shadow-[6px_6px_0px_0px_#a881f3] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <Link href="/login" onClick={playPop} className="block text-center mt-6 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                    Back to Login
                </Link>
            </div>

            <p className="mt-10 text-gray-500 font-bold text-lg z-10">
                Don't have an account?{" "}
                <Link href="/signup" onClick={playPop} className="text-black underline underline-offset-8 decoration-[3px] decoration-[#a881f3] hover:decoration-black transition-all">
                    Create one now
                </Link>
            </p>
        </div>
    );
}
