"use client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useSidebarPersistence } from "@/hooks/useSidebarPersistence";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useSidebarPersistence("admin_sidebar_collapsed", collapsed, setCollapsed);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar: Dibuat STICKY agar selalu terlihat penuh */}
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        className="hidden md:flex sticky top-0 h-screen z-30"
      />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Sidebar Container */}
        <div
          className={`absolute left-0 top-0 h-full transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            className="h-full flex"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 font-semibold">Dashboard</div>
          <a
            href="/"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View Store →
          </a>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
