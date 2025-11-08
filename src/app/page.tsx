// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// (1) Impor Ikon dari Lucide
import { ShoppingBag, Phone, Users, ShieldCheck } from "lucide-react";

// (2) Impor komponen testimoni (GRID) dan jaminan
import { TestimonialCards } from "@/components/TestimonialCards";
import { StoreGuarantees } from "@/components/StoreGuarantees";
import { TypewriterEffect } from "@/components/TypewriterEffect"; // <-- Impor efek typewriter

// Interface
interface Settings {
  storeName: string;
  storeDescription: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) setSettings(await settingsRes.json());
      } catch (error) {
        console.error("Gagal memuat data homepage:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* 1. Hero Section (Bersih, Tengah, dengan Typewriter Looping) */}
      <section className="bg-muted/30 dark:bg-gray-900/50 border-b">
        <div className="container mx-auto px-4 py-20 md:py-32">
          {/* (3) Ini adalah layout yang benar: text-center, TIDAK ADA IKON (◎) */}
          <div className="max-w-3xl mx-auto text-center">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full mx-auto" />
                <div className="flex items-center gap-3 justify-center">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            ) : (
              <>
                {/* (4) Judul dengan efek Typewriter Looping */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                  Selamat Datang di{" "}
                  {/* Kita beri 'h-14' agar layout tidak 'lompat' saat teks hilang */}
                  <span className="text-primary inline-block h-14 md:h-16">
                    <TypewriterEffect
                      text={settings?.storeName || "Store Saya"}
                      delay={0.5}
                      speed={100}
                      deleteSpeed={50}
                      pauseDuration={2500} // Jeda 2.5 detik setelah selesai ngetik
                    />
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                  {settings?.storeDescription ||
                    "Platform digital terpercaya untuk produk premium dan layanan sosial media."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild size="lg">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" /> Belanja Sekarang
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" /> Hubungi Kami
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Testimonial Cards (Grid Interaktif) */}
      <TestimonialCards />

      {/* 3. Store Guarantees (Jaminan Toko) */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-col items-center text-center px-4 mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Kenapa Memilih Kami?
          </h2>
          <p className="text-muted-foreground mt-1">
            Jaminan yang Anda dapatkan saat berbelanja di toko kami.
          </p>
        </div>
        <StoreGuarantees />
      </section>
    </div>
  );
}
