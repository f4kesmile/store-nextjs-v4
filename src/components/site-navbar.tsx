// src/components/site-navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  Home,
  Package,
  Phone,
  ShoppingCart,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { FloatingDock } from "@/components/ui/floating-dock";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}

export function SiteNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const baseLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const dockItems: DockItem[] = baseLinks.map((link) => ({
    title: link.name,
    href: link.href,
    icon: (
      <link.icon
        className={cn(
          "h-full w-full",
          pathname === link.href
            ? "text-primary"
            : "text-neutral-500 dark:text-neutral-300"
        )}
      />
    ),
  }));

  dockItems.push({
    title: `Keranjang (${cartCount})`,
    href: "/cart",
    icon: (
      <div className="relative h-full w-full">
        <ShoppingCart
          className={cn(
            "h-full w-full",
            pathname === "/cart"
              ? "text-primary"
              : "text-neutral-500 dark:text-neutral-300"
          )}
        />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {cartCount}
          </span>
        )}
      </div>
    ),
  });

  if (session) {
    dockItems.push({
      title: "Admin",
      href: "/admin",
      icon: (
        <LayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
    });
  } else {
    dockItems.push({
      title: "Login",
      href: "/login",
      icon: (
        <LogIn className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
    });
  }

  if (pathname === "/login") {
    return null;
  }

  return (
    <div className="fixed bottom-10 inset-x-0 w-full z-50 flex justify-center">
      <FloatingDock items={dockItems} />{" "}
      {/* Tidak perlu lagi desktopClassName/mobileClassName */}
    </div>
  );
}
