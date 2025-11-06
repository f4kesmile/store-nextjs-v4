"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Users, ShoppingCart, Settings, Shield, FileText, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";

const menus = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/resellers", label: "Reseller", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: FileText },
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }){
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);

  return (
    <aside className={`admin-sidebar ${collapsed?"w-16":"w-64"} shrink-0 hidden md:flex md:flex-col border-r transition-[width] duration-300`}>
      <div className="h-14 flex items-center px-3 gap-2">
        <button onClick={onToggle} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted" aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="h-4 w-4"/> : <PanelLeftClose className="h-4 w-4"/>}
        </button>
        {!collapsed && <div className="text-sm font-semibold">Devlog Store</div>}
      </div>
      <nav className="flex-1 px-2 py-2 space-y-1">
        {menus.map(({href,label,icon:Icon}) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${active?"active" : "hover:bg-muted"}`}>
              <Icon className="h-4 w-4"/>
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t">
        <button className={`w-full inline-flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm ${collapsed?"justify-center":""}`}><LogOut className="h-4 w-4"/>{!collapsed && "Logout"}</button>
      </div>
    </aside>
  );
}
