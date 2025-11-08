// src/app/contact/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  MapPin,
  MessageCircle,
  HelpCircle,
  Info,
  Send,
  Phone, // (1) Pastikan 'Phone' ada di sini
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator"; // (2) Pastikan 'Separator' diimpor

// (3) Interface yang benar
interface Settings {
  storeName: string;
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
}

// Data untuk FAQ
const faqs = [
  {
    q: "Bagaimana cara memesan?",
    a: "Pilih produk, tambah ke keranjang, lalu checkout via WhatsApp. Tim kami akan segera memandu Anda untuk pembayaran.",
  },
  {
    q: "Apakah ada garansi?",
    a: "Ya, kami menyediakan dukungan penuh dan garansi untuk setiap pemesanan. Keamanan dan kepuasan Anda adalah prioritas kami.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Saat ini kami melayani pembayaran via transfer bank dan e-wallet melalui panduan di WhatsApp. Payment gateway otomatis akan segera hadir.",
  },
  {
    q: "Berapa lama respon admin?",
    a: "Tim kami merespon rata-rata kurang dari 5 menit pada jam operasional (09:00 - 22:00 WIB).",
  },
];

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

      {/* (4) HERO SECTION BARU (Gaya Sesuai Screenshot) */}
      <section className="bg-muted/30 dark:bg-gray-900/50 border-b">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Ini adalah bagian yang Anda minta */}
            <div className="flex justify-center mb-4">
              <Phone className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Hubungi Kami
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ada pertanyaan? Tim kami siap membantu 24/7.
            </p>
            {/* --- Akhir bagian baru --- */}
          </div>
        </div>
      </section>

      {/* (5) Layout 2 Kolom (Sampingan) */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Kolom Kiri: Kartu Info Kontak */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Info Kontak
              </CardTitle>
              <CardDescription>
                Hubungi kami langsung melalui salah satu channel di bawah ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                // Skeleton
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : (
                // Isi Info Kontak Dibuat Keliatan & Dinamis
                <div className="space-y-3">
                  <Link
                    href={`https://wa.me/${settings?.supportWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-4 rounded-lg border p-4",
                      "transition-colors hover:bg-muted hover:shadow-sm"
                    )}
                  >
                    <MessageCircle className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.supportWhatsApp}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`mailto:${settings?.supportEmail}`}
                    target="_blank"
                    className={cn(
                      "flex items-center gap-4 rounded-lg border p-4",
                      "transition-colors hover:bg-muted hover:shadow-sm"
                    )}
                  >
                    <Mail className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.supportEmail}
                      </p>
                    </div>
                  </Link>

                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-lg border p-4",
                      "opacity-70" // Non-aktif
                    )}
                  >
                    <MapPin className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">Lokasi</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.storeLocation ||
                          "Segera Hhttps://maps.app.goo.gl/6kThUzRa6SbKJXiJ6adir"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kolom Kanan: Kartu Form Kontak */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Kirim Pesan
              </CardTitle>
              <CardDescription>
                Atau, kirimkan pesan Anda langsung melalui formulir di bawah
                ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* (6) Bagian FAQ (Dipindah ke Bawah) */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        <div className="flex flex-col items-center text-center px-4 mb-8">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pertanyaan Umum (FAQ)
          </h2>
          <p className="text-muted-foreground mt-1">
            Jawaban atas pertanyaan yang sering diajukan.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* (7) Footer (Dinamis) */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-5 w-72 mx-auto" />
          ) : (
            <p>
              {settings?.storeName || "Devlog Store"} ©{" "}
              {new Date().getFullYear()}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
