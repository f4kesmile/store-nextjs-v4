"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Eye,
  AlertTriangle,
  Wallet,
  PlusCircle,
  Users,
  ShoppingCart,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminCard from "@/components/admin/shared/AdminCard";
import { formatPrice, formatDate } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Komponen untuk kartu statistik
  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    variant = "default",
  }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 text-muted-foreground ${
            variant === "destructive" ? "text-red-500" : ""
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Ringkasan aktivitas toko Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          icon={Wallet}
          description="Total pendapatan dari transaksi selesai"
        />
        <StatCard
          title="Total Produk"
          value={stats?.totalProducts || 0}
          icon={Package}
          description={`${stats?.activeProducts || 0} produk aktif di katalog`}
        />
        <StatCard
          title="Pesanan Baru"
          value={
            stats?.recentTransactions?.filter(
              (t: any) => t.status === "PENDING"
            ).length || 0
          }
          icon={ShoppingCart}
          description="Transaksi menunggu konfirmasi"
        />
        <StatCard
          title="Stok Menipis"
          value={stats?.lowStockProducts || 0}
          icon={AlertTriangle}
          description="Produk dengan stok kurang dari 5"
          variant={
            stats?.lowStockProducts && stats.lowStockProducts > 0
              ? "destructive"
              : "default"
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
            <CardDescription>
              5 transaksi terbaru yang masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))
              ) : stats?.recentTransactions &&
                stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((t: any) => (
                  <div key={t.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {t.customerName || "Pelanggan Umum"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.product.name} x{t.quantity}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {t.status === "COMPLETED" ? "+" : ""}
                      {formatPrice(Number(t.totalPrice))}
                    </div>
                    <Badge
                      variant={
                        t.status === "COMPLETED"
                          ? "default"
                          : t.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="ml-4 text-[10px]"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada transaksi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Pintasan ke fitur yang sering digunakan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              {
                href: "/admin/products",
                label: "Tambah Produk Baru",
                icon: PlusCircle,
                desc: "Tambahkan produk ke katalog",
              },
              {
                href: "/admin/resellers",
                label: "Kelola Reseller",
                icon: Users,
                desc: "Daftar mitra reseller",
              },
              {
                href: "/admin/transactions",
                label: "Lihat Semua Pesanan",
                icon: ShoppingCart,
                desc: "Kelola transaksi masuk",
              },
              {
                href: "/admin/settings",
                label: "Pengaturan Toko",
                icon: Settings,
                desc: "Ubah info & tampilan toko",
              },
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
                  <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {action.desc}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
