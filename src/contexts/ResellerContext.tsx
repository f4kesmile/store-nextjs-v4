"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  clearStoredResellerRef,
  getStoredResellerRef,
} from "@/lib/reseller-utils";

interface ResellerData {
  name: string;
  whatsapp: string;
  commission?: number; // Komisinya opsional karena tidak selalu ada di response validasi
  uniqueId: string;
  id?: number; // ID Database
}

interface ResellerContextType {
  lockedRef: string | null;
  currentRef: string | null;
  activeResellerData: ResellerData | null;
  isLocked: boolean;
  lockRef: (ref: string) => void;
  resetReseller: () => void;
  getResellerWhatsApp: () => string;
}

const ResellerContext = createContext<ResellerContextType | undefined>(
  undefined
);

const STORAGE_KEY = "locked_reseller_ref";

export function ResellerProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [lockedRef, setLockedRef] = useState<string | null>(null);
  const [currentRef, setCurrentRef] = useState<string | null>(null);
  const [activeResellerData, setActiveResellerData] =
    useState<ResellerData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fungsi Validasi API
  const validateResellerRef = async (
    ref: string
  ): Promise<ResellerData | null> => {
    try {
      const res = await fetch(`/api/resellers/validate?ref=${ref}`);
      if (res.ok) {
        const data = await res.json();
        // Data yang dikembalikan dari API
        return {
          id: data.id,
          uniqueId: data.uniqueId,
          name: data.name,
          whatsapp: data.whatsappNumber,
          commission: data.commission, // Asumsi commission tidak selalu dikembalikan
        };
      }
    } catch (e) {
      console.error("API Reseller Validation Failed", e);
    }
    return null;
  };

  // 2. Load locked ref dari localStorage & URL param
  useEffect(() => {
    if (!mounted) return;

    const storedRef = getStoredResellerRef();
    const urlRef = searchParams.get("ref") || searchParams.get("reseller");

    const refToValidate = urlRef || storedRef;

    if (refToValidate) {
      validateResellerRef(refToValidate).then((data) => {
        if (data) {
          setActiveResellerData(data);

          if (urlRef) {
            lockRef(urlRef, data);
          } else if (storedRef) {
            // Auto-lock jika ref dari URL valid dan belum ada yang dikunci
            setActiveResellerData(data);
            setLockedRef(storedRef);
          }
        } else {
          // Jika ref dari URL atau storage tidak valid, hapus
          if (storedRef) clearStoredResellerRef();
          // Hapus ref dari URL jika tidak valid (pencegahan spam)
          if (urlRef) {
            const url = new URL(window.location.href);
            url.searchParams.delete("ref");
            window.history.replaceState(
              {},
              "",
              url.pathname + (url.search || "")
            );
          }
        }
      });
    }

    setCurrentRef(urlRef);
  }, [mounted, searchParams]); // Tambahkan searchParams sebagai dependency

  const lockRef = (ref: string, data?: ResellerData) => {
    // Hanya lock jika data valid tersedia atau baru divalidasi
    if (data || activeResellerData?.uniqueId === ref) {
      setLockedRef(ref);
      localStorage.setItem(STORAGE_KEY, ref);
      if (data) setActiveResellerData(data);
    } else {
      // Jika dipanggil tanpa data, coba validasi lagi
      validateResellerRef(ref).then((validatedData) => {
        if (validatedData) {
          setLockedRef(ref);
          localStorage.setItem(STORAGE_KEY, ref);
          setActiveResellerData(validatedData);
        }
      });
    }
  };

  const resetReseller = () => {
    setLockedRef(null);
    setCurrentRef(null);
    setActiveResellerData(null);
    clearStoredResellerRef();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.pathname + (url.search || ""));
    }
  };

  const getResellerWhatsApp = () => {
    return activeResellerData?.whatsapp
      ? activeResellerData.whatsapp
      : process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || "6285185031023";
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ResellerContext.Provider
      value={{
        lockedRef,
        currentRef,
        activeResellerData,
        isLocked: !!lockedRef,
        lockRef,
        resetReseller,
        getResellerWhatsApp,
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
}

export function useReseller() {
  const context = useContext(ResellerContext);
  if (context === undefined) {
    throw new Error("useReseller must be used within a ResellerProvider");
  }
  return context;
}
