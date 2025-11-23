// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/contexts/CartContext";
import { ResellerProvider } from "@/contexts/ResellerContext";
import { getServerSettings } from "@/lib/server-settings";
import HeadFavicon from "@/components/HeadFavicon";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { InteractiveCursor } from "@/components/InteractiveCursor";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSettings();
  return {
    title: settings.errorDetail
      ? "System Error"
      : settings.storeName || "Store Saya",
    description: settings.storeDescription || "Toko online modern",
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getServerSettings();

  // --- PERBAIKAN 2: PASS PLAIN OBJECT ---
  // Jangan pakai new Error(), tapi object biasa
  if (settings.errorDetail) {
    return (
      <html lang="id">
        <body>
          <MaintenanceScreen
            isError={true}
            errorObj={{ message: settings.errorDetail }} // <--- INI KUNCINYA
          />
        </body>
      </html>
    );
  }

  return (
    <html lang="id" className="cursor-none">
      <body>
        <Suspense fallback={null}>
          <Providers>
            <HeadFavicon />

            <MaintenanceGuard isMaintenanceMode={settings.isMaintenanceMode}>
              <ResellerProvider>
                <CartProvider>
                  <InteractiveCursor />
                  <main className="pb-32">{children}</main>
                  <Toaster richColors position="top-right" visibleToasts={3} />
                </CartProvider>
              </ResellerProvider>
            </MaintenanceGuard>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
