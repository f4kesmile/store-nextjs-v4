"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store, // Ikon baru untuk Reseller
  Receipt, // Ikon baru untuk Transactions
  Users,
  ShieldCheck, // Ikon baru untuk Roles
  Settings,
  Activity, // Ikon baru untuk Logs
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menus = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/resellers", label: "Reseller", icon: Store },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: Activity },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-[width] duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="h-14 flex items-center px-3 gap-2 border-b shrink-0">
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        {!collapsed && (
          <div className="text-sm font-semibold truncate">Devlog Store</div>
        )}
      </div>

      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {menus.map(({ href, label, icon: Icon }) => {
          // Logic active state yang sedikit diperbaiki agar dashboard tidak selalu aktif jika di sub-halaman
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t shrink-0 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full inline-flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-sm text-muted-foreground",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
