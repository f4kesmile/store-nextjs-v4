"use client";

import { useEffect, useState, Suspense } from "react";
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

interface Variant {
  id: number;
  name: string;
  value: string;
  stock: number;
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
  status: string;
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

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) throw new Error("Produk tidak ditemukan");
          const data = await res.json();
          setProduct(data);
          setMainImage(data.iconUrl || data.images?.[0]?.url || "");
          if (data.variants?.length > 0)
            setSelectedVariant(
              data.variants.find((v: Variant) => v.stock > 0) ||
                data.variants[0]
            );
        } catch (error) {
          toast.error("Produk tidak ditemukan");
          router.push("/products");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, router]);

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

  const activeStock = selectedVariant
    ? selectedVariant.stock
    : product?.stock || 0;
  const hasStock = activeStock > 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Pilih varian dulu.");
      return;
    }
    if (activeStock < quantity) {
      toast.error("Stok kurang.");
      setQuantity(activeStock || 1);
      return;
    }
    addToCart({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
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
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-6">
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
      {/* --- TOMBOL KEMBALI BARU YANG LEBIH BAGUS --- */}
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
      {/* ------------------------------------------- */}

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
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

        <div className="flex flex-col h-full">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatRupiah(product.price)}
              </span>
              {hasStock ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 px-3 py-1"
                >
                  Stok Tersedia: {activeStock}
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-3 py-1">
                  Stok Habis
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="prose dark:prose-invert text-muted-foreground text-sm flex-grow">
            <ReactMarkdown>
              {product.description || "*Tidak ada deskripsi.*"}
            </ReactMarkdown>
          </div>

          <div className="space-y-6 mt-8">
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Pilih Varian</Label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={
                        selectedVariant?.id === v.id ? "default" : "outline"
                      }
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      className={cn("h-9", v.stock === 0 && "opacity-50")}
                    >
                      {v.value}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {hasStock && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Jumlah Pembelian</span>
                  <div className="flex items-center border bg-background rounded-md shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
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
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuantity((q) => Math.min(activeStock, q + 1))
                      }
                      disabled={quantity >= activeStock}
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
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> + Keranjang
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border"
                    onClick={() => {
                      handleAddToCart();
                      router.push("/checkout");
                    }}
                  >
                    Beli Sekarang <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!loadingRelated && relatedProducts.length > 0 && (
        <section className="mt-24 border-t pt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Produk Lainnya
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <Card
                key={p.id}
                className="group overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 border-muted/60"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="block bg-muted/30 dark:bg-muted/10"
                >
                  <div className="relative aspect-square flex items-center justify-center overflow-hidden p-4">
                    <img
                      src={p.iconUrl || "/placeholder.svg"}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.stock === 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 left-2"
                      >
                        Habis
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4 flex flex-col flex-1">
                  <Link
                    href={`/products/${p.id}`}
                    className="font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2 flex-1"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {formatRupiah(p.price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
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
