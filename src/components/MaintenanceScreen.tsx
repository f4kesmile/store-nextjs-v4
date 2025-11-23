"use client";

import {
  RefreshCcw,
  ArrowRight,
  Home,
  ServerCrash,
  Database,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaintenanceVisual } from "@/components/visuals/MaintenanceVisual";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MaintenanceProps {
  isError?: boolean;
  errorObj?: { message: string; digest?: string };
  reset?: () => void;
}

export function MaintenanceScreen({
  isError = false,
  errorObj,
  reset,
}: MaintenanceProps) {
  const router = useRouter();
  const [systemId, setSystemId] = useState("INITIALIZING...");

  // STATE RAHASIA
  const [secretCount, setSecretCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [errorDetails, setErrorDetails] = useState({
    code: "503",
    status: "MAINTENANCE",
    message: "System Upgrade in Progress",
    icon: <ShieldAlert className="h-4 w-4" />,
  });

  const handleSecretKnock = () => {
    if (showAdminLogin) return;

    const newCount = secretCount + 1;
    setSecretCount(newCount);

    if (newCount === 3) {
      toast.info("System: Access request detected...", { duration: 1000 });
    }

    if (newCount >= 7) {
      setShowAdminLogin(true);
      toast.success("System: Admin Override Activated", {
        description: "Login Access Granted.",
        icon: <Lock className="h-4 w-4" />,
      });
      setSecretCount(0);
    }
  };

  useEffect(() => {
    setSystemId(Math.random().toString(36).substring(7).toUpperCase());

    if (isError) {
      const msg = errorObj?.message?.toLowerCase() || "";
      const digest = errorObj?.digest;

      if (
        msg.includes("database") ||
        msg.includes("connection") ||
        msg.includes("failed")
      ) {
        setErrorDetails({
          code: "500",
          status: "DB CONNECTION LOST",
          message:
            "Koneksi ke database terputus. Mohon periksa server database Anda.",
          icon: <Database className="h-4 w-4 text-red-600" />,
        });
      } else if (msg.includes("timeout") || msg.includes("504")) {
        setErrorDetails({
          code: "504",
          status: "GATEWAY TIMEOUT",
          message: "Server terlalu lama merespon permintaan.",
          icon: <ServerCrash className="h-4 w-4 text-orange-600" />,
        });
      } else if (msg.includes("502") || msg.includes("bad gateway")) {
        setErrorDetails({
          code: "502",
          status: "BAD GATEWAY",
          message: "Komunikasi antar server gagal.",
          icon: <ServerCrash className="h-4 w-4 text-red-600" />,
        });
      } else {
        setErrorDetails({
          code: digest ? `ERR-${digest.substring(0, 6)}` : "500",
          status: "INTERNAL SERVER ERROR",
          message: errorObj?.message || "Terjadi kesalahan tidak terduga.",
          icon: <ServerCrash className="h-4 w-4 text-red-600" />,
        });
      }
    } else {
      setErrorDetails({
        code: "200",
        status: "SYSTEM UPDATING",
        message:
          "Kami sedang meningkatkan kualitas layanan. Silakan kembali nanti.",
        icon: <ShieldAlert className="h-4 w-4 text-amber-600" />,
      });
    }
  }, [isError, errorObj]);

  const handleRefresh = () => {
    if (reset) reset();
    else window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden p-4 lg:p-0 transition-all duration-500">
      {/* --- BACKGROUND BERSIH & MINIMALIS --- */}
      {/* Hanya grid pattern halus */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

      {/* Vignette halus di pinggir layar (pengganti blob warna) */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,var(--background)_100%)] opacity-50 pointer-events-none" />

      {/* KARTU / LAYOUT UTAMA */}
      <Card
        className={`
            relative flex flex-col lg:flex-row overflow-hidden bg-background/80 backdrop-blur-sm transition-all duration-500
            
            /* MOBILE STYLES */
            w-full max-w-md rounded-xl border shadow-sm
            
            /* DESKTOP STYLES */
            lg:max-w-none lg:w-full lg:h-screen lg:rounded-none lg:border-none lg:shadow-none
        `}
      >
        {/* Dekorasi Garis SOLID (Tanpa Gradient) */}
        <div
          className={`
            absolute top-0 left-0 z-20
            h-1 w-full             /* Mobile: Garis tipis di atas */
            lg:h-full lg:w-1       /* Desktop: Garis tipis di kiri */
            ${
              isError
                ? "bg-red-600 dark:bg-red-500" // Merah Solid
                : "bg-primary" // Warna Utama Toko Solid
            }
          `}
        />

        {/* BAGIAN KIRI (Visual) */}
        <div
          onClick={handleSecretKnock}
          className="
            w-full lg:w-1/2 
            p-12 lg:p-0 
            flex items-center justify-center 
            bg-zinc-100/50 dark:bg-zinc-900/50
            border-b lg:border-b-0 lg:border-r border-border
            active:scale-95 transition-transform duration-100 select-none cursor-default
            relative
          "
        >
          <div className="transform lg:scale-125 transition-transform duration-500">
            <MaintenanceVisual isError={isError} />
          </div>

          <p className="hidden lg:block absolute bottom-8 text-[10px] text-zinc-400 font-mono uppercase tracking-widest opacity-50">
            System Diagnostic Tool v1.0
          </p>
        </div>

        {/* BAGIAN KANAN (Konten) */}
        <div className="w-full lg:w-1/2 flex flex-col h-full justify-center relative bg-background">
          <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-24 lg:py-0 text-center lg:text-left z-10">
            {/* Badge Status Minimalis */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest border ${
                  isError
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isError ? "bg-red-600" : "bg-amber-500"
                  }`}
                />
                CODE: {errorDetails.code}
              </div>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              {isError ? (
                <span>
                  System{" "}
                  <span className="text-red-600 dark:text-red-500">
                    Offline
                  </span>
                </span>
              ) : (
                <span>
                  Under <span className="text-primary">Maintenance</span>
                </span>
              )}
            </h1>

            <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              {errorDetails.message}
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto lg:mx-0 w-full">
              <Button
                onClick={handleRefresh}
                size="lg"
                className={`w-full font-medium transition-all ${
                  isError
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {isError ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Coba Lagi
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Cek Status
                  </>
                )}
              </Button>

              {!isError && showAdminLogin && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-dashed text-xs lg:text-sm animate-in fade-in slide-in-from-top-2 duration-500"
                  onClick={() => router.push("/login")}
                >
                  Login Admin <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              )}

              {isError && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => router.push("/")}
                >
                  <Home className="mr-2 h-3 w-3" /> Kembali ke Beranda
                </Button>
              )}
            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 lg:px-8 flex justify-between items-center text-[10px] font-mono text-muted-foreground border-t border-border lg:absolute lg:bottom-0 lg:w-full">
            <span className="flex items-center gap-2 font-medium">
              {errorDetails.icon}
              {errorDetails.status}
            </span>
            <span className="opacity-40 tracking-wider">ID: {systemId}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
