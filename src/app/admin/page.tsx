"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice } from "@/lib/utils";

// Inline SVG icons (no emoji) for a premium look
const Icons = {
  package: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="M3.29 7L12 12l8.71-5"/>
      <path d="M12 22V12"/>
    </svg>
  ),
  check: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  alert: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  money: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  filter: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18"/>
      <path d="M7 12h10"/>
      <path d="M10 18h4"/>
    </svg>
  ),
  search: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  product: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  pending: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  completed: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  lightning: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m13 2-8 14h6l-1 6 8-14h-6l1-6Z"/>
    </svg>
  ),
};

interface Product {
  id: number;
  name: string;
  stock: number;
  status: string;
  price: number;
  variants: Array<{
    id: number;
    name: string;
    value: string;
    stock: number;
  }>;
}

interface Transaction {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  product: {
    name: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalResellers: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "CRITICAL" | "OUT">("ALL");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, resellersRes, transactionsRes] = await Promise.all([
        fetch("/api/products?admin=true"),
        fetch("/api/resellers"),
        fetch("/api/transactions?limit=5"),
      ]);

      const productsData = await productsRes.json();
      const resellersData = await resellersRes.json();
      const transactionsData = await transactionsRes.json();

      const lowStockProducts = productsData.filter((product: Product) => {
        const mainStockLow = product.stock <= 5;
        const variantStockLow = product.variants?.some((v: any) => v.stock <= 3);
        return mainStockLow || variantStockLow;
      });

      const totalRevenue = transactionsData
        .filter((t: Transaction) => t.status === "COMPLETED")
        .reduce((sum: number, t: Transaction) => sum + Number(t.totalPrice), 0);

      const pendingTransactions = transactionsData.filter(
        (t: Transaction) => t.status === "PENDING"
      ).length;

      setStats({
        totalProducts: productsData.length,
        activeProducts: productsData.filter((p: Product) => p.status === "ACTIVE").length,
        totalResellers: resellersData.length,
        totalUsers: 0,
        lowStockProducts: lowStockProducts.length,
        totalRevenue,
        pendingTransactions,
      });

      setProducts(productsData);
      setRecentTransactions(transactionsData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLowStockProducts = () => {
    const filtered = products.filter((product) => {
      const mainStockLow = product.stock <= 5;
      const variantStockLow = product.variants?.some((v) => v.stock <= 3);
      const low = mainStockLow || variantStockLow;

      if (stockFilter === "ALL") return low;
      if (stockFilter === "CRITICAL") return product.stock <= 3;
      if (stockFilter === "OUT") return product.stock === 0;
      if (stockFilter === "LOW") return product.stock > 3 && low;
      return low;
    });

    return filtered
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { variant: "destructive" as const, label: "Habis" };
    if (stock <= 3) return { variant: "destructive" as const, label: "Kritis" };
    if (stock <= 10) return { variant: "warning" as const, label: "Rendah" };
    return { variant: "success" as const, label: "Aman" };
  };

  const statCards = [
    {
      title: "Total Produk",
      value: stats.totalProducts.toLocaleString("id-ID"),
      hint: "Semua produk di katalog",
      icon: Icons.package,
      accent: "from-sky-500/15 to-sky-500/5",
    },
    {
      title: "Produk Aktif",
      value: stats.activeProducts.toLocaleString("id-ID"),
      hint: "Produk yang visible",
      icon: Icons.check,
      accent: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      title: "Stock Rendah",
      value: stats.lowStockProducts.toLocaleString("id-ID"),
      hint: "Butuh restock",
      icon: Icons.alert,
      accent: "from-amber-500/15 to-amber-500/5",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      hint: "Transaksi sukses",
      icon: Icons.money,
      accent: "from-violet-500/15 to-violet-500/5",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
              <Icons.product className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-2xl">Dashboard Overview</CardTitle>
              <CardDescription>
                Welcome back, <span className="font-medium">{session?.user.name}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${s.accent}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-2">
                  <span className="size-6 rounded-md bg-muted grid place-items-center">
                    <s.icon className="w-3.5 h-3.5" />
                  </span>
                  {s.title}
                </CardDescription>
                <Icons.lightning className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {s.hint}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-md bg-amber-500/10 grid place-items-center text-amber-600">
                  <Icons.alert className="w-4 h-4" />
                </span>
                <div>
                  <CardTitle className="text-lg">Stock Alert</CardTitle>
                  <CardDescription>Produk yang perlu perhatian</CardDescription>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/products">Kelola Stock</Link>
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="relative max-w-xs">
                <Input
                  placeholder="Cari produk..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
                <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Select value={stockFilter} onValueChange={(v: any) => setStockFilter(v)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="LOW">Rendah</SelectItem>
                  <SelectItem value="CRITICAL">Kritis</SelectItem>
                  <SelectItem value="OUT">Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {getLowStockProducts().length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto size-12 rounded-full grid place-items-center bg-emerald-500/10 text-emerald-600">
                    <Icons.check className="w-6 h-6" />
                  </div>
                  <p className="mt-2 text-muted-foreground">Semua produk aman</p>
                </div>
              ) : (
                getLowStockProducts().map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge variant={getStockBadge(product.stock).variant}>
                        {getStockBadge(product.stock).label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stock utama: {product.stock} unit
                    </div>
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">Variants</div>
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="flex justify-between text-xs">
                            <span>
                              {variant.name}: {variant.value}
                            </span>
                            <Badge variant={getStockBadge(variant.stock).variant}>{variant.stock}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">Harga: {formatPrice(product.price)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-md bg-violet-500/10 grid place-items-center text-violet-600">
                  <Icons.money className="w-4 h-4" />
                </span>
                <div>
                  <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
                  <CardDescription>5 transaksi terakhir</CardDescription>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/transactions">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto size-12 rounded-full grid place-items-center bg-muted text-foreground/70">
                  <Icons.pending className="w-6 h-6" />
                </div>
                <p className="mt-2 text-muted-foreground">Belum ada transaksi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">#{t.id}</TableCell>
                      <TableCell>{t.product?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "PENDING"
                              ? "warning"
                              : t.status === "COMPLETED"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(Number(t.totalPrice))}</TableCell>
                      <TableCell className="text-right">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-sky-500/10 grid place-items-center text-sky-600">
              <Icons.lightning className="w-4 h-4" />
            </span>
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button asChild className="h-auto py-6">
              <Link href="/admin/products" className="w-full text-left">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-md bg-primary/10 grid place-items-center text-primary">
                    <Icons.package className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-semibold">Tambah Produk</div>
                    <div className="text-sm text-muted-foreground">Kelola inventory</div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/resellers" className="w-full text-left">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-md bg-violet-500/10 grid place-items-center text-violet-600">
                    <Icons.product className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-semibold">Kelola Reseller</div>
                    <div className="text-sm text-muted-foreground">Manage partners</div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/transactions" className="w-full text-left">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-md bg-emerald-500/10 grid place-items-center text-emerald-600">
                    <Icons.money className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-semibold">Lihat Transaksi</div>
                    <div className="text-sm text-muted-foreground">Monitor sales</div>
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-6">
              <Link href="/admin/settings" className="w-full text-left">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-md bg-amber-500/10 grid place-items-center text-amber-600">
                    <Icons.alert className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-semibold">Pengaturan</div>
                    <div className="text-sm text-muted-foreground">Store settings</div>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mx-auto size-12 rounded-full grid place-items-center bg-emerald-500/10 text-emerald-600">
                <Icons.check className="w-6 h-6" />
              </div>
              <div className="mt-2 font-semibold text-green-700">System Online</div>
              <div className="text-sm text-muted-foreground">All systems operational</div>
            </div>
            <div className="text-center">
              <div className="mx-auto size-12 rounded-full grid place-items-center bg-sky-500/10 text-sky-600">
                <Icons.pending className="w-6 h-6" />
              </div>
              <div className="mt-2 font-semibold text-blue-700">Auto-Sync Active</div>
              <div className="text-sm text-muted-foreground">Data synchronized</div>
            </div>
            <div className="text-center">
              <div className="mx-auto size-12 rounded-full grid place-items-center bg-violet-500/10 text-violet-600">
                <Icons.product className="w-6 h-6" />
              </div>
              <div className="mt-2 font-semibold text-purple-700">Secure Connection</div>
              <div className="text-sm text-muted-foreground">SSL encrypted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
