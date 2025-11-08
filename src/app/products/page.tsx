// src/app/products/page.tsx
"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Info,
  Search,
  Filter,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { HoverEffect, HoverEffectItem } from "@/components/ui/hover-effect";
import ImageWithFallback from "@/components/ImageWithFallback";

// --- Interface Product (sudah benar dengan createdAt) ---
interface Variant {
  id: number;
  name: string;
  value: string;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
}
interface ProductImage {
  id: number;
  url: string;
}
interface Product {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  enableNotes: boolean;
  variants: Variant[];
  images: ProductImage[];
  createdAt: string; // Ini sudah ada
}
// ---

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductsContent() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        const formattedData = data.map((p: any) => ({
          ...p,
          price: parseFloat(p.price) || 0,
          status: p.status || "ACTIVE",
          variants: (p.variants || []).map((v: any) => ({
            ...v,
            status: v.status || "ACTIVE",
          })),
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setProducts(formattedData);
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    // (PERBAIKAN KUNCI)
    // Hapus filter 'p.status === "ACTIVE"' dari sini
    // agar semua produk (termasuk INACTIVE) bisa di-render.
    let list = [...products];
    // --- AKHIR PERBAIKAN ---

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sort === "new")
      list = list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    if (sort === "price_asc") list = list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, query, sort]);

  const openProduct = (id: number) => router.push(`/products/${id}`);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="bg-muted/30 dark:bg-gray-900/50 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              <Package className="h-10 w-10 inline-block mb-2 text-primary" />
              <br />
              Katalog Produk
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Temukan produk digital terbaik untuk kebutuhan Anda.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-muted/30 p-3 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Terbaru</SelectItem>
              <SelectItem value="price_asc">Harga Terendah</SelectItem>
              <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator className="my-8" />

      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-muted-foreground">
              Coba kata kunci lain atau atur ulang filter.
            </p>
          </div>
        ) : (
          <HoverEffect className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              // Logika 'isUnavailable' Anda (Ini sekarang akan berjalan untuk SEMUA produk)
              const activeVariants = product.variants.filter(
                (v) => v.status === "ACTIVE"
              );
              const hasActiveVariants = activeVariants.length > 0;
              let isUnavailable = false;
              let statusText = "Stok Habis";

              if (product.status === "INACTIVE") {
                isUnavailable = true;
                statusText = "Tidak Tersedia"; // Ini adalah "Sold Out" Anda
              } else if (hasActiveVariants) {
                const totalVariantStock = activeVariants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                );
                isUnavailable = totalVariantStock <= 0;
              } else {
                isUnavailable = product.stock <= 0;
              }
              // --- Selesai Logika 'isUnavailable' ---

              return (
                <HoverEffectItem key={product.id} id={product.id.toString()}>
                  <Card
                    className={cn(
                      "flex flex-col h-full overflow-hidden shadow-md",
                      // Efek "abu-abu" & "tidak bisa diklik" Anda sudah benar
                      isUnavailable &&
                        "opacity-60 grayscale pointer-events-none"
                    )}
                  >
                    <div
                      className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden border-b cursor-pointer"
                      onClick={() => openProduct(product.id)}
                    >
                      <ImageWithFallback
                        src={product.iconUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Badge
                            variant="destructive"
                            className="text-sm px-3 py-1"
                          >
                            {statusText}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="flex-1 p-4 flex flex-col">
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => openProduct(product.id)}
                      >
                        <h3 className="font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {product.description.replace(/[#*`_]/g, "")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div>
                          <p className="font-bold text-lg text-primary">
                            {formatRupiah(product.price)}
                          </p>
                          {product.variants.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              {product.variants.length} Varian
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Stok: {product.stock}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openProduct(product.id)}
                        // (PERBAIKAN) Tombol detail harus BISA diklik
                        // agar pengguna bisa lihat produknya, meskipun INACTIVE
                        disabled={false}
                      >
                        Detail
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={isUnavailable} // Logika disabled Anda sudah benar
                        onClick={() => {
                          if (isUnavailable) return;
                          if (product.variants.length > 0) {
                            openProduct(product.id);
                            toast.info("Pilih varian di halaman detail");
                            return;
                          }
                          addToCart({
                            productId: product.id,
                            productName: product.name,
                            productPrice: product.price,
                            productImage: product.iconUrl || "",
                            quantity: 1,
                            maxStock: product.stock,
                            enableNotes: product.enableNotes,
                          });
                          toast.success("Ditambahkan ke keranjang");
                        }}
                      >
                        {product.variants.length > 0 ? "Pilih" : "+ Keranjang"}
                      </Button>
                    </CardFooter>
                  </Card>
                </HoverEffectItem>
              );
            })}
          </HoverEffect>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
