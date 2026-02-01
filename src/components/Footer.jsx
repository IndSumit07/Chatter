"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Send, Sparkles, MessageSquare } from "lucide-react";
import { usePopSound } from "@/hooks/usePopSound";

export default function Footer() {
    const playPop = usePopSound();

    return (
        <footer className="w-full bg-[#e9e9e9] pt-20 pb-10 px-4 border-t-2 border-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="md:col-span-1 space-y-6">
                        <Link
                            href="/"
                            onClick={playPop}
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-10 h-10 bg-[#ccfd52] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                                <MessageSquare className="w-6 h-6 text-black" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-black">Chatter</span>
                        </Link>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            The next generation chat platform for modern teams. Built for speed, security, and pure interaction.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Github, href: "#" },
                                { icon: Instagram, href: "#" },
                                { icon: Linkedin, href: "#" }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    onClick={playPop}
                                    className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all hover:bg-[#a881f3] hover:text-white"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links - Column 1 */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-black uppercase tracking-wider">Product</h4>
                        <ul className="space-y-4">
                            {['Features', 'Integrations', 'Enterprise', 'Solutions', 'Pricing'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        onClick={playPop}
                                        className="text-gray-600 font-bold hover:text-[#a881f3] transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links - Column 2 */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-black uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-4">
                            {['Documentation', 'API Reference', 'Community', 'Help Center', 'Status'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        onClick={playPop}
                                        className="text-gray-600 font-bold hover:text-[#a881f3] transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-black uppercase tracking-wider">Stay Updated</h4>
                        <p className="text-gray-600 font-medium">Join our newsletter to get the latest updates and features.</p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white border-2 border-black rounded-xl p-4 pr-12 font-bold placeholder:text-gray-400 focus:outline-none shadow-[4px_4px_0px_0px_#000000] focus:shadow-[6px_6px_0px_0px_#000000] transition-all"
                            />
                            <button
                                onClick={playPop}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#ccfd52] border-2 border-black rounded-lg flex items-center justify-center hover:bg-black hover:text-[#ccfd52] transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-2 border-black/5 rounded-lg p-3">
                            <Sparkles className="w-5 h-5 text-[#a881f3]" />
                            <span className="text-xs font-bold text-gray-500 italic">No spam, just quality updates.</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t-2 border-black/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 font-bold text-sm">
                        © {new Date().getFullYear()} Chatter Inc. All rights reserved.
                    </div>
                    <div className="flex gap-8">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                            <Link
                                key={item}
                                href="#"
                                onClick={playPop}
                                className="text-gray-500 font-bold text-sm hover:text-black transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Background Stars */}
            <div className="absolute left-0 bottom-0 pointer-events-none opacity-5 overflow-hidden w-full h-full">
                <Sparkles className="absolute top-1/4 left-1/4 w-20 h-20 text-black animate-spin-slow" />
                <Sparkles className="absolute bottom-1/4 right-1/4 w-32 h-32 text-black animate-float-gentle" />
            </div>
        </footer>
    );
}
