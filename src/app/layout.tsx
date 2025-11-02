"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/contexts/CartContext";
import { useEffect } from "react";
import { useSettings } from "@/lib/hooks/use-settings";

export const metadata: Metadata = {
  title: "Store Saya - E-Commerce",
  description: "Toko online modern dengan sistem manajemen lengkap",
};

function ThemeVarsProvider() {
  const settings = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.primaryColor || "#2563EB");
    root.style.setProperty("--secondary", settings.secondaryColor || "#10B981");
    root.setAttribute("data-theme", settings.theme || "light");
  }, [settings.primaryColor, settings.secondaryColor, settings.theme]);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeVarsProvider />
        <Providers>
          <CartProvider>{children}</CartProvider>
        </Providers>
      </body>
    </html>
  );
}
