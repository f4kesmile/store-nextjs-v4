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
import { cn } from "@/lib/utils"; // [PERBAIKAN] Pastikan 'cn' di-impor

// ... (Interface dan formatRupiah tetap sama) ...
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
  status: "ACTIVE" | "INACTIVE"; // Pastikan status ada di interface
  enableNotes: boolean;
  variants: Variant[];
  images: ProductImage[];
}

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
  const { addToCart, getCartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    (async () => {
      try {
        // API sekarang mengembalikan SEMUA produk (aktif dan non-aktif)
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    // [PERBAIKAN] Hapus filter status dari sini
    let list = [...products]; // Salin array untuk sorting

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (sort === "price_asc") list = list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, query, sort]);

  const openProduct = (id: number) => router.push(`/products/${id}`);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container mx-auto px-4 pt-6 pb-4">
        {/* ... (Header dan Filter Bar tetap sama) ... */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-7 w-7 hidden sm:block" />
              Katalog Produk
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Temukan produk digital terbaik untuk kebutuhan Anda.
            </p>
          </div>
        </div>
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

      <Separator />

      <section className="container mx-auto px-4 py-8">
        {loading ? (
          // ... (Loading Skeletons tetap sama) ...
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // ... (Tampilan "Tidak ada produk" tetap sama) ...
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
          // Product Grid Responsif
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              // [PERBAIKAN] Logika 'isUnavailable' yang baru
              const activeVariants = product.variants.filter(
                (v) => v.status === "ACTIVE"
              );
              const hasActiveVariants = activeVariants.length > 0;

              let isUnavailable = false;
              let statusText = "Stok Habis"; // Default text

              if (product.status === "INACTIVE") {
                isUnavailable = true;
                statusText = "Tidak Tersedia";
              } else if (hasActiveVariants) {
                // Produk Aktif, cek stok varian
                const totalVariantStock = activeVariants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                );
                isUnavailable = totalVariantStock <= 0;
              } else {
                // Produk Aktif, tidak punya varian, cek stok utama
                isUnavailable = product.stock <= 0;
              }
              // Selesai Logika 'isUnavailable'

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md",
                    // [PERBAIKAN] Terapkan style abu-abu & non-interaktif
                    isUnavailable && "opacity-60 grayscale pointer-events-none"
                  )}
                >
                  {/* Gambar Produk */}
                  <div
                    className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer border-b"
                    // [PERBAIKAN] Hapus onClick, biarkan tombol "Detail"
                  >
                    {product.iconUrl ? (
                      <img
                        src={product.iconUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <Info className="h-16 w-16 text-muted-foreground/30" />
                    )}

                    {/* [PERBAIKAN] Gunakan logika 'isUnavailable' baru */}
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
                      // [PERBAIKAN] Hapus onClick, biarkan tombol "Detail"
                      className="cursor-pointer flex-1"
                    >
                      <h3 className="font-semibold leading-tight line-clamp-2 mb-2 hover:text-primary transition-colors">
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
                      // [PERBAIKAN] Tombol detail tetap aktif agar user bisa lihat
                      // Tapi jika Anda ingin mematikannya juga, hapus komentar di bawah
                      // disabled={isUnavailable}
                    >
                      Detail
                    </Button>
                    <Button
                      className="flex-1"
                      // [PERBAIKAN] Selalu disable jika tidak tersedia
                      disabled={isUnavailable}
                      onClick={() => {
                        // (Logika add to cart tetap sama)
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
              );
            })}
          </div>
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
