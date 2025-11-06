"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingBlob, Wave } from "@/components/visuals/svg-animated";
import { revealOnScroll } from "@/lib/anim";

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
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } finally {
        setLoading(false);
        setTimeout(revealOnScroll, 0);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* Hero with SVGs */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-10 text-center">
          <div className="absolute -top-10 -left-10">
            <FloatingBlob />
          </div>
          <div className="absolute -bottom-12 -right-12 rotate-12">
            <FloatingBlob />
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-72 mx-auto" />
              <Skeleton className="h-6 w-[36rem] max-w-full mx-auto" />
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          ) : (
            <div data-reveal>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Selamat Datang di {" "}
                <span className="text-primary">{settings?.storeName || "Store Saya"}</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                {settings?.storeDescription || "Platform digital terpercaya untuk kebutuhan produk premium dan layanan sosial media."}
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild>
                  <Link href="/products">🛍️ Belanja Sekarang</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">📞 Hubungi Kami</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="text-primary/60">
          <Wave />
        </div>
      </section>

      {/* Features with reveal */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[{t:"🚀 Cepat & Aman",d:"Transaksi cepat dengan sistem keamanan terpercaya"},{t:"💎 Produk Premium",d:"Koleksi produk digital berkualitas tinggi"},{t:"🤝 Support 24/7",d:"Tim support siap membantu kapan saja"}].map((f,i)=>(
            <Card key={i} data-reveal>
              <CardHeader>
                <CardTitle>{f.t}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{f.d}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-reveal>
          {[['Produk', '120+'], ['Pelanggan', '5K+'], ['Rating', '4.9'], ['Negara', '10+']].map(([k,v])=> (
            <Card key={k}>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-primary">{v}</p>
                <p className="text-xs text-muted-foreground mt-1">{k}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
