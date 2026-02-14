"use client";

import DashboardSidebar from "./components/DashboardSidebar";
import DashboardNavbar from "./components/DashboardNavbar";
import { PresenceProvider } from "@/contexts/PresenceContext";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#e9e9e9] font-sans overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative">
          <PresenceProvider>{children}</PresenceProvider>
        </main>
      </div>
    </div>
  );
}
