// src/components/StoreGuarantees.tsx
"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// (1) Impor Ikon (bukan emoji)
import { ShieldCheck, PackageCheck, MessagesSquare, Zap } from "lucide-react";

// (2) Data Jaminan
const guarantees = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Proses Cepat",
    description:
      "Pesanan Anda diproses secara otomatis dan instan, 24/7 tanpa henti.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Keamanan Terjamin",
    description:
      "Kami menjamin keamanan akun dan privasi data Anda selama bertransaksi.",
  },
  {
    icon: <PackageCheck className="h-8 w-8 text-primary" />,
    title: "Garansi Produk",
    description:
      "Dapatkan jaminan penuh atau uang kembali jika produk tidak sesuai pesanan.",
  },
  {
    icon: <MessagesSquare className="h-8 w-8 text-primary" />,
    title: "Dukungan Penuh",
    description:
      "Tim support kami siap membantu Anda jika mengalami kendala kapan saja.",
  },
];

export function StoreGuarantees() {
  return (
    // (3) Section ini sekarang HANYA berisi grid
    <section className="container mx-auto px-4 pt-8 pb-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {guarantees.map((item) => (
          <Card
            key={item.title}
            className="flex flex-col items-center p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* (4) Ikon ditampilkan di dalam lingkaran */}
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              {item.icon}
            </div>
            <CardHeader className="p-0">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardDescription className="mt-2">
              {item.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
