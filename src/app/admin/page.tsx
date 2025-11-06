"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Eye, AlertTriangle, Wallet, PlusCircle, Users, Receipt, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-muted/10">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, developer</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Panel gelap untuk seluruh konten */}
        <div className="rounded-2xl border bg-card text-card-foreground p-6 md:p-8 space-y-6">
          {/* Section header dalam panel */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Ringkasan toko Anda</p>
            </div>
            <Badge variant="secondary" className="text-[11px]">{formatDate(new Date())}</Badge>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            {[{t:"Total Produk",i:Package,v:"0",s:"Semua produk di katalog"},{t:"Produk Aktif",i:Eye,v:"0",s:"Produk yang visible"},{t:"Stock Rendah",i:AlertTriangle,v:"0",s:"Butuh restock"},{t:"Total Revenue",i:Wallet,v:formatPrice(0),s:"Transaksi sukses"}].map((c)=>{
              const Icon = c.i as any;
              return (
                <Card key={c.t} className="bg-background/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground inline-flex items-center gap-2"><Icon className="h-4 w-4"/> {c.t}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{formatDate(new Date())}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{c.v}</div>
                    <p className="text-xs text-muted-foreground mt-1">{c.s}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick actions */}
          <Card className="bg-background/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">Quick Actions <span className="text-xs font-normal text-muted-foreground">Aksi cepat yang sering digunakan</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3">
                {[{href:"/admin/products/new",t:"Tambah Produk",i:PlusCircle,s:"Kelola inventory"},{href:"/admin/resellers",t:"Kelola Reseller",i:Users,s:"Manage partners"},{href:"/admin/orders",t:"Lihat Transaksi",i:Receipt,s:"Monitor sales"},{href:"/admin/settings",t:"Pengaturan",i:Settings,s:"Store settings"}].map((a)=>{
                  const Icon = a.i as any;
                  return (
                    <Link key={a.t} href={a.href} className="group rounded-md border p-4 hover:bg-muted transition">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center"><Icon className="h-4 w-4"/></span>
                        <div className="min-w-0">
                          <p className="font-medium leading-none line-clamp-1">{a.t}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{a.s}</p>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition"/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
