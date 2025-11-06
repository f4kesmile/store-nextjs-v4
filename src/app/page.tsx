"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Settings {
  storeName: string;
  storeDescription: string;
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
  aboutTitle: string;
  aboutDescription: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-8 text-center">
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
              Selamat Datang di {" "}
              <span className="text-primary">
                {settings?.storeName || "Store Saya"}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              {settings?.storeDescription ||
                "Platform digital terpercaya untuk semua kebutuhan produk premium dan layanan sosial media."}
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href="/products">🛍️ Belanja Sekarang</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">📞 Hubungi Kami</Link>
              </Button>
            </div>
          </>
        )}
      </section>

      {/* Quick Filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Jelajahi Produk</h2>
          <div className="w-64 hidden md:block">
            <Input placeholder="Cari produk..." />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="popular">Terpopuler</TabsTrigger>
            <TabsTrigger value="new">Terbaru</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Cepat & Aman</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Transaksi cepat dengan sistem keamanan terpercaya
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>💎 Produk Premium</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Koleksi produk digital berkualitas tinggi
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🤝 Support 24/7</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Tim support siap membantu kapan saja
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* About Section */}
      {settings?.aboutTitle && settings?.aboutDescription && (
        <section className="container mx-auto px-4 pb-16">
          <Card className="bg-gradient-to-br from-muted/70 to-muted p-0 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {settings.aboutTitle}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto whitespace-pre-line">
                {settings.aboutDescription}
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <a
                    href={`https://wa.me/${settings.supportWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Chat WhatsApp
                  </a>
                </Button>
                <Button asChild>
                  <a href={`mailto:${settings.supportEmail}`}>
                    📧 Kirim Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center">
          <h3 className="text-xl font-bold mb-1">
            {settings?.storeName || "Store Saya"}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {settings?.storeDescription}
          </p>
          <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground">
            {settings?.storeLocation && (
              <>
                <span>📍 {settings.storeLocation}</span>
                <span>•</span>
              </>
            )}
            <span>📧 {settings?.supportEmail}</span>
            <span>•</span>
            <span>💬 {settings?.supportWhatsApp}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
