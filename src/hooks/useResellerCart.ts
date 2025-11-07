'use client';

import { useReseller } from '@/contexts/ResellerContext';
// HAPUS import yang tidak perlu, karena checkout sudah ditangani server
// import { generateWhatsAppLink, buildCheckoutMessage } from '@/lib/reseller-utils'; 
import { CartItem } from '@/types/reseller';

export function useResellerCart() {
  const { getResellerWhatsApp, lockedRef, activeResellerData } = useReseller();

  // Fungsi ini tidak lagi relevan, tapi kita jaga agar tidak ada error di file lain yang mungkin memanggilnya
  const processCheckout = (items: CartItem[]) => {
    console.warn("processCheckout hook dipanggil, namun checkout kini ditangani sepenuhnya oleh API.");
    // Logika pengiriman WA yang sebenarnya ada di src/app/checkout/page.tsx
  };

  const getActiveReseller = () => {
    return activeResellerData; 
  };

  const isResellerActive = () => {
    return !!lockedRef;
  };

  return {
    processCheckout,
    getActiveReseller,
    isResellerActive,
    whatsappNumber: getResellerWhatsApp()
  };
}