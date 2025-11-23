"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useTheme } from "next-themes";

// 1. Definisi Tipe Data yang Lengkap
export type StoreSettings = {
  id?: number;
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
  isMaintenanceMode: boolean; // Pastikan ini ada
  errorDetail?: string; // Untuk menangani error dari server
};

// 2. Default Value yang Aman
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
  isMaintenanceMode: false,
};

type SettingsContextType = {
  settings: StoreSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  setSettingsLocal: (s: Partial<StoreSettings>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

// Cache sederhana di luar komponen agar persist antar navigasi
let globalSettingsCache: StoreSettings | null = null;
let globalCacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

export function SettingsProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: StoreSettings | null;
}) {
  // State inisialisasi
  const [settings, setSettings] = useState<StoreSettings>(
    initial || globalSettingsCache || defaultSettings
  );

  // Loading state: True jika tidak ada initial data & cache sudah kadaluarsa
  const [loading, setLoading] = useState<boolean>(
    !initial &&
      (!globalSettingsCache || Date.now() - globalCacheTimestamp > CACHE_TTL)
  );

  const { setTheme } = useTheme();

  // Fungsi Fetch Data (dipisahkan agar bisa dipanggil ulang)
  const fetchSettings = useCallback(async () => {
    try {
      // Tambahkan timestamp query param untuk bypass browser cache
      const res = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });

      if (!res.ok) throw new Error("Failed to fetch settings");

      const data = (await res.json()) as StoreSettings;

      // Merge dengan default untuk memastikan tidak ada field undefined
      const mergedData = {
        ...defaultSettings,
        ...data,
        // Pastikan boolean tidak undefined/null
        isMaintenanceMode: data.isMaintenanceMode ?? false,
      };

      // Update Cache Global
      globalSettingsCache = mergedData;
      globalCacheTimestamp = Date.now();

      setSettings(mergedData);
    } catch (error) {
      console.error("❌ Failed to load settings:", error);
      // Jangan set loading false jika error fatal, biarkan UI lama atau default
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect: Initial Load
  useEffect(() => {
    // Jika ada initial props (biasanya dari Server Component), pakai itu
    if (initial) {
      globalSettingsCache = initial;
      globalCacheTimestamp = Date.now();
      setSettings(initial);
      setLoading(false);
      return;
    }

    // Jika cache masih valid, pakai cache
    if (globalSettingsCache && Date.now() - globalCacheTimestamp < CACHE_TTL) {
      setSettings(globalSettingsCache);
      setLoading(false);
      return;
    }

    // Jika tidak, fetch dari API
    fetchSettings();
  }, [initial, fetchSettings]);

  // Effect: Sinkronisasi Tema
  useEffect(() => {
    if (!loading && settings.theme) {
      // Hanya set tema jika berbeda untuk menghindari re-render berlebih
      setTheme(settings.theme);
    }
  }, [settings.theme, loading, setTheme]);

  // Fungsi update local state (optimistic UI update)
  const setSettingsLocal = useCallback(
    (newPart: Partial<StoreSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newPart };

        // Update global cache juga agar sinkron
        globalSettingsCache = updated;
        globalCacheTimestamp = Date.now();

        // Langsung apply tema jika berubah
        if (newPart.theme) {
          setTheme(newPart.theme);
        }

        return updated;
      });
    },
    [setTheme]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refresh: fetchSettings, // Expose fungsi fetch ulang
        setSettingsLocal,
      }}
    >
      <ThemeVariables settings={settings} />
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Komponen kecil untuk menyuntikkan variabel CSS dinamis
function ThemeVariables({ settings }: { settings: StoreSettings }) {
  return (
    <style
      id="settings-theme-vars"
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          --primary: ${settings.primaryColor};
          --secondary: ${settings.secondaryColor};
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
