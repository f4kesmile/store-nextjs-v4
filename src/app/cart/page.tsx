"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"; // Tambah ikon
import { toast } from "sonner";

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading Cart...
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}

function CartContent() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();

  const [filter, setFilter] = useState("");

  const list = useMemo(() => {
    if (!filter.trim()) return cart;
    const q = filter.toLowerCase();
    return cart.filter((i) => i.productName.toLowerCase().includes(q));
  }, [cart, filter]);

  const total = getCartTotal();

  const handleCheckout = async () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container mx-auto px-4 py-6 md:py-8">
        {/* Header Responsive: Stack di mobile, baris di desktop */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 hidden md:block" />
            Keranjang ({getCartCount()})
          </h1>

          {cart.length > 0 && (
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Cari di keranjang..."
                  className="pr-8"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Kosongkan keranjang?")) {
                    clearCart();
                    toast.success("Keranjang dikosongkan");
                  }
                }}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Kosongkan</span>
              </Button>
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Keranjang belanja Anda kosong
              </p>
              <p className="text-sm mb-6">
                Sepertinya Anda belum menambahkan produk apapun.
              </p>
              <Button asChild>
                <Link href="/products">Mulai Belanja</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:items-start">
            {/* Daftar Item */}
            <div className="lg:col-span-2 space-y-4">
              {list.map((item) => (
                <Card
                  key={`${item.productId}-${item.variantId ?? "no"}`}
                  className="overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Gambar Produk */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center shrink-0 border">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      {/* Detail Produk */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div className="space-y-1">
                            <p className="font-semibold text-base line-clamp-2">
                              {item.productName}
                            </p>
                            {item.variantName && (
                              <p className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md inline-block">
                                {item.variantName}: {item.variantValue}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive -mt-1 -mr-2 shrink-0"
                            onClick={() => {
                              removeFromCart(item.productId, item.variantId);
                              toast.success("Item dihapus");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Kontrol Kuantitas & Harga Mobile */}
                        <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
                          <div className="flex items-center border rounded-md shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.variantId
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-10 text-center text-sm font-medium">
                              {item.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variantId
                                )
                              }
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground font-medium">
                              Rp {item.productPrice.toLocaleString("id-ID")} x{" "}
                              {item.quantity}
                            </p>
                            <p className="font-bold text-primary">
                              Rp{" "}
                              {(
                                item.productPrice * item.quantity
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Catatan (Opsional) */}
                    {item.enableNotes !== false && (
                      <div className="mt-4 pt-3 border-t">
                        <Input
                          placeholder="Tulis catatan untuk produk ini (opsional)..."
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateNotes(
                              item.productId,
                              e.target.value,
                              item.variantId
                            )
                          }
                          className="text-sm bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ringkasan Pesanan - Sticky di Desktop */}
            <div className="lg:col-span-1 lg:sticky lg:top-20">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Item</span>
                      <span>{getCartCount()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal Produk
                      </span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Bayar</span>
                    <span className="text-xl font-bold text-primary">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={getCartCount() === 0}
                  >
                    Checkout Sekarang
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Lanjut Belanja
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
