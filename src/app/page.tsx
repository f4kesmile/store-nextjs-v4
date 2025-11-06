"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Phone } from "lucide-react";

interface Settings { storeName: string; storeDescription: string; }

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
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* Hero */}
      <section>
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center">
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
              <>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Selamat Datang di <span className="text-primary">{settings?.storeName || "Store Saya"}</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                  {settings?.storeDescription || "Platform digital terpercaya untuk produk premium dan layanan sosial media."}
                </p>
                <div className="flex justify-center gap-3">
                  <Button asChild>
                    <Link href="/products" className="inline-flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4"/> Belanja Sekarang
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact" className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4"/> Hubungi Kami
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[{t:"Keamanan",d:"Transaksi cepat dengan sistem keamanan terpercaya"},{t:"Premium",d:"Koleksi produk digital berkualitas tinggi"},{t:"Support",d:"Tim support siap membantu kapan saja"}].map((f,i)=>(
            <Card key={i}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
