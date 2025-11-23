"use client";

import { usePathname } from "next/navigation";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";
import { useEffect, useState } from "react";

export function MaintenanceGuard({
  children,
  isMaintenanceMode,
}: {
  children: React.ReactNode;
  isMaintenanceMode: boolean;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Jangan render apapun sebelum client-side hydration selesai untuk menghindari flash
  if (!isMounted) return null;

  // DAFTAR RUTE YANG BOLEH DIAKSES SAAT MAINTENANCE
  const isBypassRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/api/auth"); // Penting untuk login next-auth

  // Jika Maintenance Aktif DAN Bukan Rute Admin/Login -> Tampilkan Layar Maintenance
  if (isMaintenanceMode && !isBypassRoute) {
    return <MaintenanceScreen />;
  }

  // Jika aman, tampilkan konten asli
  return <>{children}</>;
}
