"use client";

import { useEffect, useState } from "react";
import { useReseller } from "@/contexts/ResellerContext";
import { Badge } from "@/components/ui/badge";

export function ResellerBadge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side to avoid hydration mismatch
  }

  try {
    // PERBAIKAN: Mengambil 'activeResellerData' alih-alih memanggil 'getResellerData'
    const { lockedRef, activeResellerData } = useReseller();

    if (!lockedRef || !activeResellerData) return null;

    // Menggunakan properti aktif secara langsung
    const resellerName = activeResellerData.name;

    return (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-800 border-green-300 dark:bg-green-800/50 dark:text-green-200"
      >
        Via {resellerName || lockedRef}
      </Badge>
    );
  } catch (error) {
    // Fail silently if context is not available
    return null;
  }
}
