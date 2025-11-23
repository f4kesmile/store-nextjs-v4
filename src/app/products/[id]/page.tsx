"use client";

// [FIX 1/2] Impor 'useMemo' dari React
import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Info,
  ChevronLeft,
  Loader2,
  Minus,
  Plus,
  Zap,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// --- INTERFACE DIPERBARUI ---
interface Variant {
  id: number;
  name: string;
  value: string;
  stock: number;
  price?: number | null; // <-- TAMBAHKAN HARGA
  status: "ACTIVE" | "INACTIVE"; // [FITUR] Tambah status
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
  status: "ACTIVE" | "INACTIVE"; // [FITUR] Tambah status
  enableNotes: boolean;
  variants: Variant[];
  images: ProductImage[];
}
// -----------------------------

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // [FITUR] Pisahkan varian yang aktif
  const availableVariants = useMemo(() => {
    return product?.variants.filter((v) => v.status === "ACTIVE") || [];
  }, [product]);

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) throw new Error("Produk tidak ditemukan");
          const data = await res.json();

          // [FITUR] Cek status produk utama
          if (data.status !== "ACTIVE") {
            throw new Error("Produk ini sedang tidak tersedia");
          }

          // Konversi harga varian
          data.variants = data.variants.map((v: any) => ({
            ...v,
            price: v.price ? parseFloat(v.price) : null,
            status: v.status || "ACTIVE", // Pastikan status ada
          }));

          setProduct(data);
          setMainImage(data.iconUrl || data.images?.[0]?.url || "");

          // [FITUR] Logika pemilihan varian default diubah
          if (data.variants?.length > 0) {
            const activeVariants = data.variants.filter(
              (v: Variant) => v.status === "ACTIVE"
            );
            setSelectedVariant(
              activeVariants.find((v: Variant) => v.stock > 0) ||
                activeVariants[0] || // Fallback ke varian aktif pertama walau stok 0
                null // Jika tidak ada varian aktif
            );
          }
        } catch (error: any) {
          toast.error(error.message || "Produk tidak ditemukan");
          router.push("/products");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, router]);

  // ... (useEffect untuk relatedProducts tetap sama) ...
  useEffect(() => {
    if (id) {
      (async () => {
        setLoadingRelated(true);
        try {
          const res = await fetch("/api/products?limit=8");
          if (!res.ok) throw new Error("Gagal memuat produk lain");
          let allProducts: Product[] = await res.json();
          setRelatedProducts(
            allProducts
              .filter((p) => p.id !== Number(id) && p.status === "ACTIVE")
              .sort(() => 0.5 - Math.random())
              .slice(0, 4)
          );
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingRelated(false);
        }
      })();
    }
  }, [id]);

  // --- LOGIKA HARGA DAN STOK DIPERBARUI ---
  const activeStock = selectedVariant
    ? selectedVariant.stock
    : product?.stock || 0;
  const activePrice =
    (selectedVariant?.price != null // Cek jika 0 atau null/undefined
      ? selectedVariant.price
      : product?.price) || 0;

  // [FITUR] Cek stok dan status
  const hasVariants = (product?.variants?.length || 0) > 0;
  const hasActiveVariants = availableVariants.length > 0;

  // Logika "bisa dibeli"
  const isPurchasable = () => {
    if (product?.status !== "ACTIVE") return false; // Produk utama non-aktif
    if (hasVariants) {
      // Jika punya varian, setidaknya 1 varian harus aktif
      if (!hasActiveVariants) return false;
      // Varian yang dipilih harus ada, aktif, dan punya stok
      return (
        selectedVariant &&
        selectedVariant.status === "ACTIVE" &&
        selectedVariant.stock > 0
      );
    }
    // Jika tidak punya varian, stok produk utama harus ada
    return (product?.stock || 0) > 0;
  };

  const hasStock = isPurchasable();

  // [PERBAIKAN] Logika display stock agar dinamis mengikuti varian
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
    ? availableVariants.reduce((sum: number, v: Variant) => sum + v.stock, 0)
    : product?.stock || 0;
  // ----------------------------------------

  const handleAddToCart = () => {
    if (!product) return;

    // [FITUR] Validasi yang disempurnakan
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Pilih varian yang tersedia dulu.");
      return;
    }
    if (selectedVariant && selectedVariant.status !== "ACTIVE") {
      toast.error("Varian yang dipilih tidak tersedia.");
      return;
    }
    if (!hasStock || activeStock < quantity) {
      toast.error("Stok tidak mencukupi.");
      setQuantity(activeStock || 1);
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productPrice: activePrice, // <-- KIRIM HARGA AKTIF
      productImage: product.iconUrl || "",
      quantity,
      maxStock: activeStock,
      enableNotes: product.enableNotes,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      variantValue: selectedVariant?.value,
    });
    toast.success("Masuk keranjang");
  };

  if (loading)
    // ... (Loading skeleton tetap sama)
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        {/* [PERBAIKAN] Ubah grid jadi 5 kolom */}
        <div className="grid lg:grid-cols-5 gap-10">
          <Skeleton className="aspect-square w-full rounded-xl lg:col-span-2" />
          <div className="space-y-6 lg:col-span-3">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );

  if (!product) return null;

  const allImages = [
    product.iconUrl,
    ...(product.images?.map((img) => img.url) || []),
  ].filter(Boolean) as string[];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (Tombol Kembali tetap sama) ... */}
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="group pl-0 text-muted-foreground hover:text-primary transition-colors -ml-2"
        >
          <Link href="/products" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Kembali ke Katalog</span>
          </Link>
        </Button>
      </div>

      {/* [PERBAIKAN] Ubah grid jadi 5 kolom */}
      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
        {/* [PERBAIKAN] Beri gambar 2 kolom */}
        <div className="space-y-4 lg:col-span-2">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative aspect-square bg-muted/30 dark:bg-muted/10 rounded-2xl overflow-hidden cursor-zoom-in border shadow-sm flex items-center justify-center group">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Info className="h-20 w-20 text-muted-foreground/30" />
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0 shadow-none flex items-center justify-center outline-none">
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              )}
            </DialogContent>
          </Dialog>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(url)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 bg-muted/30 rounded-lg overflow-hidden border-2 transition-all",
                    mainImage === url
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-border"
                  )}
                >
                  <img
                    src={url}
                    alt={`thumbnail-${i}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* [PERBAIKAN] Beri detail 3 kolom */}
        <div className="flex flex-col h-full lg:col-span-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              {/* --- TAMPILAN HARGA DIPERBARUI --- */}
              <span className="text-3xl font-bold text-primary">
                {formatRupiah(activePrice)}
              </span>
              {/* ------------------------------- */}
              {/* [FITUR] Tampilan stok diperbarui */}
              {displayStock > 0 ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 px-3 py-1"
                >
                  Stok Tersedia: {displayStock}
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-3 py-1">
                  Stok Habis
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* ... (Deskripsi Markdown tetap sama) ... */}
          <div className="prose dark:prose-invert text-muted-foreground text-sm flex-grow">
            <ReactMarkdown>
              {product.description || "*Tidak ada deskripsi.*"}
            </ReactMarkdown>
          </div>

          <div className="space-y-6 mt-8">
            {/* [FITUR] Logic render varian diubah */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Pilih Varian</Label>
                {availableVariants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Semua varian untuk produk ini sedang tidak tersedia.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      // Cek status dan stok
                      const isAvailable = v.status === "ACTIVE";
                      const hasStock = v.stock > 0;
                      const isDisabled = !isAvailable || !hasStock;

                      return (
                        <Button
                          key={v.id}
                          variant={
                            selectedVariant?.id === v.id ? "default" : "outline"
                          }
                          onClick={() => setSelectedVariant(v)}
                          disabled={isDisabled} // Nonaktifkan jika tidak aktif ATAU stok 0
                          className={cn(
                            "h-9 relative",
                            isDisabled && "opacity-50 line-through" // Tambahkan coretan
                          )}
                          title={
                            !isAvailable
                              ? "Varian non-aktif"
                              : !hasStock
                              ? "Stok habis"
                              : ""
                          }
                        >
                          {v.value}
                          {/* Tampilkan harga varian jika ada & berbeda */}
                          {v.price != null && v.price !== product.price && (
                            <span className="ml-2 text-xs opacity-80">
                              ({formatRupiah(v.price)})
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* [FITUR] Tombol Kuantitas & Beli hanya muncul jika bisa dibeli */}
            {displayStock > 0 ? (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Jumlah Pembelian</span>
                  <div className="flex items-center border bg-background rounded-md shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !hasStock}
                      className="h-9 w-9 rounded-none px-0"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      className="w-14 h-9 text-center border-0 rounded-none focus-visible:ring-0 font-medium"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(activeStock, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      disabled={!hasStock}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuantity((q) => Math.min(activeStock, q + 1))
                      }
                      disabled={quantity >= activeStock || !hasStock}
                      className="h-9 w-9 rounded-none px-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    size="lg"
                    className="text-base font-semibold shadow-md"
                    onClick={handleAddToCart}
                    disabled={!hasStock} // Nonaktifkan jika tidak bisa dibeli
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> + Keranjang
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border"
                    onClick={() => {
                      if (!hasStock) return;
                      handleAddToCart();
                      router.push("/checkout");
                    }}
                    disabled={!hasStock} // Nonaktifkan jika tidak bisa dibeli
                  >
                    Beli Sekarang <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="p-4 border-destructive bg-destructive/5">
                <p className="text-center font-medium text-destructive-foreground">
                  Produk ini sedang tidak tersedia.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ... (Related Products tetap sama) ... */}
    </div>
  );
}

export default function Page() {
  return (
    <PageLayout>
      <Suspense>
        <ProductDetailContent />
      </Suspense>
    </PageLayout>
  );
}
