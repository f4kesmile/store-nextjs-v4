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
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
  aboutTitle: string;
  aboutDescription: string;
}

export default function ContactPage() {
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
        <div className="container mx-auto px-4 pt-14 pb-10 text-center">
          <div className="absolute -top-8 -right-10 rotate-6">
            <FloatingBlob />
          </div>
          <div className="absolute -bottom-10 -left-10 -rotate-6">
            <FloatingBlob />
          </div>

          <div data-reveal>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Hubungi Kami</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ada pertanyaan? Tim kami siap membantu 24/7 melalui email dan WhatsApp.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </>
              ) : (
                <>
                  <Button asChild>
                    <a href={`https://wa.me/${settings?.supportWhatsApp}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`mailto:${settings?.supportEmail}`}>📧 Email</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-primary/60">
          <Wave />
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-4">
        {[{
          t: 'Email', d: 'Tanyakan apapun via email.', a: () => loading ? <Skeleton className='h-5 w-48'/> : <a className='text-primary underline' href={`mailto:${settings?.supportEmail}`}>{settings?.supportEmail}</a>
        },{
          t: 'WhatsApp', d: 'Respon cepat via WhatsApp.', a: () => loading ? <Skeleton className='h-5 w-40'/> : <a className='text-primary underline' href={`https://wa.me/${settings?.supportWhatsApp}`} target='_blank' rel='noopener noreferrer'>{settings?.supportWhatsApp}</a>
        },{
          t: 'Lokasi', d: 'Kantor pusat kami.', a: () => loading ? <Skeleton className='h-5 w-56'/> : <span className='text-muted-foreground'>{settings?.storeLocation || '-'}</span>
        }].map((c,i)=> (
          <Card key={i} data-reveal>
            <CardHeader>
              <CardTitle>{c.t}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-2">{c.d}</p>
              {c.a()}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid md:grid-cols-2 gap-4" data-reveal>
          {[['Bagaimana cara memesan?','Pilih produk, tambah ke keranjang, lalu checkout via WhatsApp.'],['Apakah ada garansi?','Kami menyediakan dukungan penuh untuk setiap pemesanan.'],['Metode pembayaran?','WhatsApp order aktif; payment gateway akan menyusul.'],['Berapa lama respon?','Biasanya kurang dari 5 menit di jam operasional.']].map(([q,a])=> (
            <Card key={q}>
              <CardHeader>
                <CardTitle className="text-base">{q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{a}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-3 flex-wrap">
            {settings?.supportEmail && <span>📧 {settings.supportEmail}</span>}
            {settings?.supportWhatsApp && <span>• 💬 {settings.supportWhatsApp}</span>}
            {settings?.storeLocation && <span>• 📍 {settings.storeLocation}</span>}
          </div>
          {settings?.aboutTitle && (
            <p className="mt-2">{settings.aboutTitle}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
