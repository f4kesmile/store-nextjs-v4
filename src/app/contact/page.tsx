"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

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
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* Hero (no decorative SVG) */}
      <section>
        <div className="container mx-auto px-4 pt-14 pb-8 text-center">
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
                  <a href={`https://wa.me/${settings?.supportWhatsApp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${settings?.supportEmail}`} className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-4">
        {[{
          t: 'Email', i: Mail, d: 'Tanyakan apapun via email.', a: () => loading ? <Skeleton className='h-5 w-48'/> : <a className='text-primary underline' href={`mailto:${settings?.supportEmail}`}>{settings?.supportEmail}</a>
        },{
          t: 'WhatsApp', i: MessageCircle, d: 'Respon cepat via WhatsApp.', a: () => loading ? <Skeleton className='h-5 w-40'/> : <a className='text-primary underline' href={`https://wa.me/${settings?.supportWhatsApp}`} target='_blank' rel='noopener noreferrer'>{settings?.supportWhatsApp}</a>
        },{
          t: 'Lokasi', i: MapPin, d: 'Kantor pusat kami.', a: () => loading ? <Skeleton className='h-5 w-56'/> : <span className='text-muted-foreground'>{settings?.storeLocation || '-'}</span>
        }].map((c,i)=> {
          const Icon = c.i;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <CardTitle>{c.t}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-2">{c.d}</p>
                {c.a()}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid md:grid-cols-2 gap-4">
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
            {settings?.supportEmail && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3"/> {settings.supportEmail}</span>}
            {settings?.supportWhatsApp && <span className="inline-flex items-center gap-1">• <MessageCircle className="h-3 w-3"/> {settings.supportWhatsApp}</span>}
            {settings?.storeLocation && <span className="inline-flex items-center gap-1">• <MapPin className="h-3 w-3"/> {settings.storeLocation}</span>}
          </div>
          {settings?.aboutTitle && (
            <p className="mt-2">{settings.aboutTitle}</p>
          )}
        </div>
      </footer>
    </div>
  );
}
