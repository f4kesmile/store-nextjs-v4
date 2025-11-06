"use client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }){
  useEffect(() => {
    document.documentElement.classList.add("admin-dark");
    document.body.classList.add("admin-body");
    return () => {
      document.documentElement.classList.remove("admin-dark");
      document.body.classList.remove("admin-body");
    };
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <AdminSidebar collapsed={collapsed} onToggle={()=> setCollapsed(v=>!v)} />

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen?"":"pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/40 transition ${mobileOpen?"opacity-100":"opacity-0"}`} onClick={()=>setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-72 admin-sidebar border-r bg-card transition-transform ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>
          <AdminSidebar collapsed={false} onToggle={()=> setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-3 md:px-4 justify-between">
          <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted" onClick={()=> setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5"/>
          </button>
          <div className="text-sm text-muted-foreground">Welcome back, developer</div>
          <a href="/" className="text-sm underline-offset-4 hover:underline">View Store</a>
        </div>
        <main className={`flex-1 p-3 md:p-6 transition-[margin] duration-300 ${collapsed?"md:ml-16":"md:ml-64"}`}>{children}</main>
      </div>
    </div>
  );
}
