"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider as NextThemesProvider } from "next-themes"; // <-- PERBAIKAN: Impor di sini

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // PERBAIKAN: Bungkus semuanya dengan NextThemesProvider DI DALAM file "use client" ini
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // Ini akan otomatis memilih light/dark mode
      enableSystem
    >
      <SessionProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </SessionProvider>
    </NextThemesProvider>
  );
}
