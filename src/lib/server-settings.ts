// src/lib/server-settings.ts
import { prisma } from "./prisma";

export type ServerSettings = {
  storeName: string;
  storeDescription?: string;
  faviconUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: string;
  isMaintenanceMode: boolean;
  errorDetail?: string; // Tambahan untuk membawa pesan error
};

export async function getServerSettings(): Promise<ServerSettings> {
  const defaults = {
    storeName: "Store Saya",
    storeDescription: "Toko online modern",
    faviconUrl: "/favicon.ico",
    logoUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    theme: "light",
    isMaintenanceMode: false,
  };

  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) return defaults;

    return {
      storeName: settings.storeName,
      storeDescription: settings.storeDescription || "",
      faviconUrl: settings.faviconUrl || "/favicon.ico",
      logoUrl: settings.logoUrl || "",
      primaryColor: settings.primaryColor || "#2563EB",
      secondaryColor: settings.secondaryColor || "#10B981",
      theme: settings.theme || "light",
      isMaintenanceMode: settings.isMaintenanceMode || false,
    };
  } catch (error: any) {
    console.error("Server Settings Error:", error);

    // Deteksi tipe error untuk pesan yang lebih spesifik
    let errorMessage = "Terjadi kesalahan internal pada server.";
    
    if (error.message?.includes("Can't reach database server") || error.code === 'P1001') {
      errorMessage = "Database Connection Failed (Connection Refused)";
    } else if (error.code === 'P1003') {
      errorMessage = "Database Not Found";
    } else if (error.message?.includes("Timed out")) {
      errorMessage = "Connection Timed Out";
    }

    // Return defaults TAPI dengan mode maintenance aktif & detail error
    return {
      ...defaults,
      isMaintenanceMode: true, // Paksa maintenance mode
      errorDetail: errorMessage, // Bawa pesan error ini ke UI
    };
  }
}