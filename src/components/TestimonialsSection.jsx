"use client";

import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Chatter has completely transformed how our design team collaborates. The realtime visuals are unmatched!",
    name: "Alex Rivera",
    role: "Product Designer",
    avatarColor: "bg-blue-400",
    face: "👨‍💻",
  },
  {
    id: 2,
    text: "I was skeptical at first, but the voice notes feature is a game changer. Crystal clear quality every time.",
    name: "Sarah Chen",
    role: "Freelance Developer",
    avatarColor: "bg-purple-400",
    face: "👩‍🚀",
  },
  {
    id: 3,
    text: "Finally, a chat app that doesn't feel cluttered. The interface is clean, fast, and simply beautiful.",
    name: "Marcus Johnson",
    role: "Startup Founder",
    avatarColor: "bg-green-400",
    face: "🦸‍♂️",
  },
  {
    id: 4,
    text: "The best alternative to Slack I've tried. It connects me with my remote team instantly without the noise.",
    name: "Emily Davis",
    role: "Marketing Lead",
    avatarColor: "bg-pink-400",
    face: "👩‍🎨",
  },
  {
    id: 5,
    text: "Video calls that actually work seamlessly in the browser? Sign me up. Chatter is fantastic!",
    name: "David Kim",
    role: "Tech Blogger",
    avatarColor: "bg-yellow-400",
    face: "🎥",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-[#e9e9e9] py-20 overflow-hidden border-t-2 border-black/5">
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] tracking-tight">
          Don't take our word for it
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
          See what our community has to say about the new era of messaging.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden mask-gradient-x">
        {/* Gradient Masks for smooth fade edges - updated to match light bg */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#e9e9e9] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#e9e9e9] to-transparent z-10 pointer-events-none"></div>

        <div className="flex w-max animate-scroll hover:pause py-12">
          {/* First Set */}
          <div className="flex gap-6 px-3">
            {testimonials.map((t) => (
              <TestimonialCard key={`a-${t.id}`} {...t} />
            ))}
          </div>
          {/* Duplicate Set for Loop */}
          <div className="flex gap-6 px-3">
            {testimonials.map((t) => (
              <TestimonialCard key={`b-${t.id}`} {...t} />
            ))}
          </div>
          {/* Triplicate Set for wide screens just in case */}
          <div className="flex gap-6 px-3">
            {testimonials.map((t) => (
              <TestimonialCard key={`c-${t.id}`} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ text, name, role, avatarColor, face }) {
  return (
    <div className="w-[350px] md:w-[400px] bg-white rounded-3xl p-8 flex flex-col justify-between border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-8px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:z-50 relative transition-all duration-300 shrink-0 group">
      <div>
        <Quote className="w-10 h-10 text-gray-300 mb-6 fill-gray-100 group-hover:text-[#a881f3] group-hover:fill-[#a881f3]/20 transition-colors duration-300" />
        <p className="text-gray-700 text-lg font-medium leading-relaxed mb-6">
          "{text}"
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-2xl border-2 border-black`}
        >
          {face}
        </div>
        <div>
          <div className="text-black font-bold">{name}</div>
          <div className="text-gray-500 text-sm font-bold">{role}</div>
        </div>
      </div>
    </div>
  );
}
