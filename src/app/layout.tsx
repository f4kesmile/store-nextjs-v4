import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/contexts/CartContext";
import { ResellerProvider } from "@/contexts/ResellerContext";
import { getServerSettings } from "@/lib/server-settings";
import HeadFavicon from "@/components/HeadFavicon";
import { Toaster } from "sonner";
import { Suspense } from "react"; // <-- Import Suspense

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSettings();
  return {
    title: settings.storeName || "Store Saya - E-Commerce",
    description:
      settings.storeDescription ||
      "Toko online modern dengan sistem manajemen lengkap",
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
      shortcut: settings.faviconUrl || "/favicon.ico",
      apple: settings.faviconUrl || "/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {/* FIX: Bungkus Providers di Suspense untuk mengatasi useSearchParams di SSR/SSG */}
        <Suspense fallback={null}>
          <Providers>
            <HeadFavicon />
            <ResellerProvider>
              <CartProvider>
                {children}
                <Toaster richColors position="top-right" visibleToasts={3} />
              </CartProvider>
            </ResellerProvider>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
