import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#e9e9e9]">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
