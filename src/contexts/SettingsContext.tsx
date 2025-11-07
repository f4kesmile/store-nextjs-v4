"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTheme } from "next-themes"; // <-- PERBAIKAN 1: Import useTheme

export type StoreSettings = {
  storeName: string;
  storeDescription?: string;
  supportWhatsApp?: string;
  supportEmail?: string;
  storeLocation?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  locale: string;
};

const defaultSettings: StoreSettings = {
  storeName: "Store Saya",
  storeDescription: "Toko online modern dengan sistem manajemen lengkap",
  supportWhatsApp: "",
  supportEmail: "",
  storeLocation: "",
  aboutTitle: "",
  aboutDescription: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#2563EB",
  secondaryColor: "#10B981",
  theme: "light",
  locale: "id",
};

type Ctx = {
  settings: StoreSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  setSettingsLocal: (s: Partial<StoreSettings>) => void;
};

const SettingsCtx = createContext<Ctx | null>(null);

let cachedSettings: StoreSettings | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function SettingsProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: StoreSettings | null;
}) {
  const [settings, setSettings] = useState<StoreSettings>(
    initial || cachedSettings || defaultSettings
  );
  const [loading, setLoading] = useState<boolean>(
    !initial && (!cachedSettings || Date.now() - cacheTime > CACHE_DURATION)
  );

  // --- PERBAIKAN 2: Dapatkan fungsi setTheme dari next-themes ---
  const { setTheme } = useTheme();

  useEffect(() => {
    if (initial) {
      cachedSettings = initial;
      cacheTime = Date.now();
      setLoading(false);
      return;
    }

    if (cachedSettings && Date.now() - cacheTime < CACHE_DURATION) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = (await res.json()) as StoreSettings;
        if (!abort) {
          cachedSettings = data;
          cacheTime = Date.now();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, [initial]);

  // --- PERBAIKAN 3: Sinkronkan tema saat settings dimuat ---
  useEffect(() => {
    if (!loading && settings.theme) {
      // Terapkan tema yang dimuat dari database ke next-themes
      setTheme(settings.theme);
    }
    // Kita juga tambahkan setTheme sebagai dependensi
  }, [settings.theme, loading, setTheme]);

  const refresh = async () => {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = (await res.json()) as StoreSettings;
    cachedSettings = data;
    cacheTime = Date.now();
    setSettings(data);
  };

  const setSettingsLocal = (s: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      cachedSettings = next;
      cacheTime = Date.now();

      // --- PERBAIKAN 4: Langsung ubah tema saat di-update dari admin ---
      if (s.theme) {
        setTheme(s.theme);
      }

      return next;
    });
  };

  return (
    <SettingsCtx.Provider
      value={{ settings, loading, refresh, setSettingsLocal }}
    >
      <ThemeVariables settings={settings} />
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

function ThemeVariables({ settings }: { settings: StoreSettings }) {
  return (
    <style
      id="settings-theme-vars"
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          /* PERBAIKAN: 
            Ganti '--brand-primary' menjadi '--primary' 
            Ganti '--brand-secondary' menjadi '--secondary'
            Ini akan menimpa default HSL dari globals.css dengan HEX dari database.
          */
          --primary: ${settings.primaryColor};
          --secondary: ${settings.secondaryColor};

          /* (Variabel di bawah ini tidak lagi diperlukan, tapi tidak masalah jika tetap ada) */
          --brand-primary: ${settings.primaryColor};
          --brand-secondary: ${settings.secondaryColor};
        }
        .brand-primary { color: var(--primary) !important; }
        .bg-brand-primary { background: var(--primary) !important; }
        .border-brand-primary { border-color: var(--primary) !important; }
        .bg-brand-soft { background: color-mix(in srgb, var(--primary) 10%, white) !important; }
      `,
      }}
    />
  );
}
