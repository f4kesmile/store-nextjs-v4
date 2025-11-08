// src/components/TestimonialCards.tsx
"use client";

import React from "react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/section-header";
import { Users } from "lucide-react";
// (1) Impor komponen HoverEffect yang baru kita buat
import { HoverEffect, HoverEffectItem } from "@/components/ui/hover-effect";

const testimonials = [
  {
    quote:
      "Layanan sangat cepat dan produknya berkualitas. Saya sangat merekomendasikannya!",
    name: "Ahmad Subarjo",
    title: "Digital Marketer",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "Respon admin sangat ramah dan membantu. Prosesnya mudah dan tidak berbelit-belit.",
    name: "Siti Aminah",
    title: "Content Creator",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "Jaminan garansi penuh membuat saya tenang. Benar-benar toko yang bisa dipercaya.",
    name: "Budi Santoso",
    title: "Pemilik Toko Online",
    avatar: "/placeholder-user.jpg",
  },
  // (2) Tambahkan lebih banyak testimoni agar grid terlihat penuh (opsional, untuk responsif)
  {
    quote:
      "Harga bersaing dengan kualitas yang premium. Pasti akan order lagi di sini.",
    name: "Dewi Lestari",
    title: "Social Media Manager",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "Setelah menggunakan layanan dari sini, engagement media sosial saya meningkat pesat!",
    name: "Eko Prasetyo",
    title: "Influencer",
    avatar: "/placeholder-user.jpg",
  },
  {
    quote:
      "Toko paling direkomendasikan untuk semua kebutuhan digital. Mantap!",
    name: "Rian Hidayat",
    title: "Freelancer",
    avatar: "/placeholder-user.jpg",
  },
];

export function TestimonialCards() {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Header (Ikon + Judul) - Ditaruh di tengah */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="flex justify-center mb-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Kepuasan Pelanggan
        </h2>
        <p className="text-muted-foreground mt-1">
          Apa kata mereka yang telah menggunakan layanan kami.
        </p>
      </div>

      {/* (3) Gunakan HoverEffect di sini, bukan marquee */}
      <HoverEffect className="mt-8">
        {" "}
        {/* Tambahkan margin top untuk jarak */}
        {testimonials.map((item, index) => (
          <HoverEffectItem key={item.name} id={`item-${index}`}>
            {/* (4) Ini adalah isi dari setiap kartu, menggunakan shadcn/ui Card */}
            <Card className="flex h-full flex-col justify-between overflow-hidden shadow-md">
              <CardHeader className="flex-1 pb-4">
                <blockquote className="text-lg font-medium leading-relaxed">
                  "{item.quote}"
                </blockquote>
              </CardHeader>
              <CardFooter className="mt-4 flex items-center gap-3 border-t bg-muted/50 p-4">
                <Avatar>
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
              </CardFooter>
            </Card>
          </HoverEffectItem>
        ))}
      </HoverEffect>
    </section>
  );
}
