"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatPrice } from "@/lib/utils";

const Icons = {
  package: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.29 7L12 12l8.71-5"/><path d="M12 22V12"/></svg>),
  check: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M20 6 9 17l-5-5" /></svg>),
  alert: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>),
  money: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>),
  search: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  product: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>),
  pending: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>),
  lightning: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="m13 2-8 14h6l-1 6 8-14h-6l1-6Z"/></svg>),
  user: (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0112 0"/></svg>),
};

interface Product { id: number; name: string; stock: number; status: string; price: number; variants: Array<{ id: number; name: string; value: string; stock: number }>; }
interface Transaction { id: number; status: string; totalPrice: number; createdAt: string; product: { name: string }; }

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, totalResellers: 0, totalUsers: 0, lowStockProducts: 0, totalRevenue: 0, pendingTransactions: 0, });
  const [products, setProducts] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "CRITICAL" | "OUT">("ALL");

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, resellersRes, transactionsRes] = await Promise.all([ fetch("/api/products?admin=true"), fetch("/api/resellers"), fetch("/api/transactions?limit=5"), ]);
      const productsData = await productsRes.json(); const resellersData = await resellersRes.json(); const transactionsData = await transactionsRes.json();
      const lowStockProducts = productsData.filter((product: Product) => { const mainStockLow = product.stock <= 5; const variantStockLow = product.variants?.some((v: any) => v.stock <= 3); return mainStockLow || variantStockLow; });
      const totalRevenue = transactionsData.filter((t: Transaction) => t.status === "COMPLETED").reduce((sum: number, t: Transaction) => sum + Number(t.totalPrice), 0);
      const pendingTransactions = transactionsData.filter((t: Transaction) => t.status === "PENDING").length;
      setStats({ totalProducts: productsData.length, activeProducts: productsData.filter((p: Product) => p.status === "ACTIVE").length, totalResellers: resellersData.length, totalUsers: 0, lowStockProducts: lowStockProducts.length, totalRevenue, pendingTransactions, });
      setProducts(productsData); setRecentTransactions(transactionsData.slice(0, 5));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getLowStockProducts = () => { const filtered = products.filter((product) => { const mainStockLow = product.stock <= 5; const variantStockLow = product.variants?.some((v) => v.stock <= 3); const low = mainStockLow || variantStockLow; if (stockFilter === "ALL") return low; if (stockFilter === "CRITICAL") return product.stock <= 3; if (stockFilter === "OUT") return product.stock === 0; if (stockFilter === "LOW") return product.stock > 3 && low; return low; }); return filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10); };

  const getStockBadge = (stock: number) => { if (stock === 0) return { variant: "destructive" as const, label: "Habis" }; if (stock <= 3) return { variant: "destructive" as const, label: "Kritis" }; if (stock <= 10) return { variant: "warning" as const, label: "Rendah" }; return { variant: "success" as const, label: "Aman" }; };

  const statCards = [
    { title: "Total Produk", value: stats.totalProducts.toLocaleString("id-ID"), hint: "Semua produk di katalog", icon: Icons.package, accent: "from-sky-500/15 to-sky-500/5" },
    { title: "Produk Aktif", value: stats.activeProducts.toLocaleString("id-ID"), hint: "Produk yang visible", icon: Icons.check, accent: "from-emerald-500/15 to-emerald-500/5" },
    { title: "Stock Rendah", value: stats.lowStockProducts.toLocaleString("id-ID"), hint: "Butuh restock", icon: Icons.alert, accent: "from-amber-500/15 to-amber-500/5" },
    { title: "Total Revenue", value: formatPrice(stats.totalRevenue), hint: "Transaksi sukses", icon: Icons.money, accent: "from-violet-500/15 to-violet-500/5" },
  ];

  if (loading) { return (<div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-muted-foreground">Loading dashboard...</p></div></div>); }

  return (
    <div className="space-y-6">
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white grid place-items-center border">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M5 12v7a2 2 0 002 2h7"/></svg>
            </div>
            <div>
              <CardTitle className="text-2xl">Dashboard Overview</CardTitle>
              <CardDescription>Welcome back, <span className="font-medium">{session?.user.name}</span></CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${s.accent}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="flex items-center gap-2">
                  <span className="size-6 rounded-md bg-muted grid place-items-center"><s.icon className="w-3.5 h-3.5" /></span>
                  {s.title}
                </CardDescription>
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{s.hint}</CardContent>
          </Card>
        ))}
      </div>

      {/* Rest of the page unchanged */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-sky-500/10 grid place-items-center text-sky-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-8 14h6l-1 6 8-14h-6l1-6Z"/></svg>
            </span>
            <div>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ href: "/admin/products", title: "Tambah Produk", desc: "Kelola inventory", Icon: Icons.package, },{ href: "/admin/resellers", title: "Kelola Reseller", desc: "Manage partners", Icon: Icons.product, },{ href: "/admin/transactions", title: "Lihat Transaksi", desc: "Monitor sales", Icon: Icons.money, },{ href: "/admin/settings", title: "Pengaturan", desc: "Store settings", Icon: Icons.alert, }].map(({ href, title, desc, Icon }) => (
              <Button asChild className="w-full p-0 h-auto" key={href}>
                <Link href={href} className="w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-center gap-3 p-4 min-h-[88px]">
                    <span className="flex-shrink-0 size-9 rounded-md bg-white/15 grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">{title}</div>
                      <div className="text-xs opacity-90 truncate">{desc}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
