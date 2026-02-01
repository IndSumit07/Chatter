"use client";

import Link from "next/link";
import {
  MessageSquare,
  Github,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

export default function SignupPage() {
  const playPop = usePopSound();

  return (
    <div className="min-h-screen bg-[#e9e9e9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[15%] right-[8%] animate-spin-slow opacity-20">
        <Star className="w-24 h-24 text-[#a881f3]" />
      </div>
      <div className="absolute bottom-[15%] left-[8%] animate-float-gentle opacity-20">
        <Star className="w-20 h-20 text-[#ccfd52]" />
      </div>

      {/* Logo Link */}
      <Link
        href="/"
        onClick={playPop}
        className="flex items-center gap-2 mb-10 group z-10"
      >
        <div className="w-12 h-12 bg-[#a881f3] border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] rotate-[5deg] group-hover:rotate-0 transition-transform">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <span className="text-3xl font-black tracking-tighter text-black uppercase">
          Chatter
        </span>
      </Link>

      {/* Signup Card */}
      <div className="w-full max-w-[500px] bg-white border-[3px] border-black rounded-[2.5rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_#000000] z-10 relative">
        <div className="space-y-2 mb-10 text-center">
          <h1 className="text-4xl font-black text-black">Start Your Journey</h1>
          <p className="text-gray-500 font-bold text-lg italic">
            Join the next generation of chat.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="name@domain.com"
                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#ccfd52] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
              Create Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={playPop}
            className="w-full bg-[#ccfd52] text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#b8e546] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group mt-8"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-black/5"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              Or sign up with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center">
          <button
            onClick={playPop}
            className="w-full flex items-center gap-3 bg-white border-2 border-black p-4 rounded-2xl font-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <p className="mt-10 text-gray-500 font-bold text-lg z-10">
        Already have an account?{" "}
        <Link
          href="/login"
          onClick={playPop}
          className="text-black underline underline-offset-8 decoration-[3px] decoration-[#ccfd52] hover:decoration-black transition-all"
        >
          Sign in here
        </Link>
      </p>

      {/* Floating Badge */}
      <div className="absolute bottom-[20%] right-[5%] hidden xl:block animate-float-gentle opacity-50">
        <div className="bg-white border-2 border-black p-4 rounded-2xl rotate-[-8deg] shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-sm">Join 10k+ users online</span>
        </div>
      </div>
    </div>
  );
}
