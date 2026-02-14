"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Mail,
  Lock,
  User,
  ArrowRight,
  Star,
  AtSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";
import toast from "react-hot-toast";

export default function SignupPage() {
  const playPop = usePopSound();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Validation Logic
  useEffect(() => {
    const { username, password } = formData;
    let newErrors = { username: "", password: "" };
    let valid = true;

    // Username Validation
    if (username) {
      if (username.length < 3) {
        newErrors.username = "At least 3 characters";
        valid = false;
      } else if (username.length > 30) {
        newErrors.username = "Max 30 characters";
        valid = false;
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        newErrors.username = "Letters, numbers, underscores only";
        valid = false;
      }
    } else {
      valid = false; // Required
    }

    // Password Validation
    if (password) {
      if (password.length < 6) {
        newErrors.password = "At least 6 characters";
        valid = false;
      }
    } else {
      valid = false; // Required
    }

    // Required fields check
    if (!formData.fullName || !formData.email) valid = false;

    setErrors(newErrors);
    setIsFormValid(valid);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
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

        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-500 font-bold text-lg italic">Join the next generation of chat.</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSignup}>
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
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-black text-black uppercase tracking-widest">
                Username
              </label>
              {formData.username && (
                <span className={`text-xs font-bold ${errors.username ? "text-red-500" : "text-green-600"} flex items-center gap-1`}>
                  {errors.username || (
                    <>
                      <CheckCircle className="w-3 h-3" /> Looks good
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <AtSign className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johndoe_123"
                className={`w-full bg-gray-50 border-2 ${errors.username ? "border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444]" : "border-black focus:shadow-[4px_4px_0px_0px_#ccfd52]"} rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none transition-all`}
              />
            </div>
            <p className="text-xs text-gray-500 font-bold ml-1">
              3-30 chars, letters, numbers & underscores only
            </p>
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@domain.com"
                className="w-full bg-gray-50 border-2 border-black rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_#a881f3] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-black text-black uppercase tracking-widest">
                Create Password
              </label>
              {formData.password && (
                <span className={`text-xs font-bold ${errors.password ? "text-red-500" : "text-green-600"} flex items-center gap-1`}>
                  {errors.password || (
                    <>
                      <CheckCircle className="w-3 h-3" /> Strong enough
                    </>
                  )}
                </span>
              )}
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
                className={`w-full bg-gray-50 border-2 ${errors.password ? "border-red-500 focus:shadow-[4px_4px_0px_0px_#ef4444]" : "border-black focus:shadow-[4px_4px_0px_0px_#ccfd52]"} rounded-2xl p-4 pl-12 font-bold focus:bg-white focus:outline-none transition-all`}
              />
            </div>
            <p className="text-xs text-gray-500 font-bold ml-1">
              Must be at least 6 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            onClick={playPop}
            className="w-full bg-[#ccfd52] text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#b8e546] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px]"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
            {!loading && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

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
