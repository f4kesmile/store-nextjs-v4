// src/lib/reseller-utils.ts
// FILE INI HANYA MENYEDIAKAN FUNGSI UTILITY DASAR DAN MANAJEMEN STORAGE

// Hapus semua data RESELLER_DATA lama yang hardcoded

// Interface dasar yang diperlukan oleh file lain
export interface ResellerData {
  name: string;
  whatsapp: string;
  commission?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// --- Fungsi Manajamen Storage ---
const STORAGE_KEY = 'locked_reseller_ref';

export function getStoredResellerRef(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function storeResellerRef(ref: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, ref);
}

export function clearStoredResellerRef(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// --- Fungsi Pesan WhatsApp ---
export function generateWhatsAppLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// HAPUS: Fungsi buildCheckoutMessage yang lama
// KARENA pesan WA kini dihasilkan oleh API /api/checkout/route.ts
// Biarkan fungsi ini tetap ada, tapi kosong/sederhana agar tidak error di hook yang memanggilnya.
export function buildCheckoutMessage(items: any[], total: number, resellerRef?: string): string {
  // Karena API yang menangani pembuatan pesan, fungsi ini sekarang hanya placeholder untuk hook lama.
  return "Mohon tunggu, pesanan sedang diproses.";
}