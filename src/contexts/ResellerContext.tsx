'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ResellerContextType {
  lockedRef: string | null;
  currentRef: string | null;
  isLocked: boolean;
  lockRef: (ref: string) => void;
  resetReseller: () => void;
  getResellerWhatsApp: () => string;
  getResellerData: () => ResellerData | null;
}

interface ResellerData {
  name: string;
  whatsapp: string;
  commission: number;
}

const RESELLER_DATA: Record<string, ResellerData> = {
  'RESELLER-A': {
    name: 'Reseller A',
    whatsapp: '6281234567890',
    commission: 10
  },
  'RESELLER-B': {
    name: 'Reseller B', 
    whatsapp: '6281234567891',
    commission: 15
  },
  'RESELLER-C': {
    name: 'Reseller C',
    whatsapp: '6281234567892', 
    commission: 12
  }
};

const ResellerContext = createContext<ResellerContextType | undefined>(undefined);

const STORAGE_KEY = 'locked_reseller_ref';

export function ResellerProvider({ children }: { children: React.ReactNode }) {
  const [lockedRef, setLockedRef] = useState<string | null>(null);
  const [currentRef, setCurrentRef] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load locked ref from localStorage on mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && RESELLER_DATA[stored]) {
        setLockedRef(stored);
      }
    }
  }, [mounted]);

  // Monitor URL params for ref (only on client side)
  useEffect(() => {
    if (!mounted) return;
    
    const checkUrlRef = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        
        if (ref && RESELLER_DATA[ref]) {
          setCurrentRef(ref);
          
          // Auto-lock if no ref is locked yet
          if (!lockedRef) {
            lockRef(ref);
          }
        } else {
          setCurrentRef(null);
        }
      }
    };
    
    checkUrlRef();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkUrlRef);
    return () => window.removeEventListener('popstate', checkUrlRef);
  }, [mounted, lockedRef]);

  const lockRef = (ref: string) => {
    if (RESELLER_DATA[ref]) {
      setLockedRef(ref);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, ref);
      }
    }
  };

  const resetReseller = () => {
    setLockedRef(null);
    setCurrentRef(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      
      // Remove ref from URL without affecting cart
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }
  };

  const getResellerWhatsApp = () => {
    const ref = lockedRef || currentRef;
    return ref && RESELLER_DATA[ref] 
      ? RESELLER_DATA[ref].whatsapp 
      : process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || '6281234567890';
  };

  const getResellerData = () => {
    const ref = lockedRef || currentRef;
    return ref && RESELLER_DATA[ref] ? RESELLER_DATA[ref] : null;
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ResellerContext.Provider
      value={{
        lockedRef,
        currentRef,
        isLocked: !!lockedRef,
        lockRef,
        resetReseller,
        getResellerWhatsApp,
        getResellerData
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
}

export function useReseller() {
  const context = useContext(ResellerContext);
  if (context === undefined) {
    throw new Error('useReseller must be used within a ResellerProvider');
  }
  return context;
}