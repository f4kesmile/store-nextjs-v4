"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Cart...</div>}>
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
    return cart.filter(i => i.productName.toLowerCase().includes(q));
  }, [cart, filter]);

  const total = getCartTotal();

  const handleCheckout = async () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Keranjang ({getCartCount()})</h1>
          <div className="flex items-center gap-2">
            <Input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Cari di keranjang..." className="w-56" />
            <Button variant="destructive" onClick={() => { if (confirm("Kosongkan keranjang?")) { clearCart(); toast({ title: "Keranjang dikosongkan" }); } }}>Kosongkan</Button>
          </div>
        </div>

        {list.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Keranjang kosong. <Link href="/products" className="text-primary underline">Belanja sekarang</Link>.
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {list.map((item) => (
                <Card key={`${item.productId}-${item.variantId ?? "no"}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted/40 rounded-md overflow-hidden flex items-center justify-center">
                        {item.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.productImage} alt={item.productName} className="max-h-20 object-contain" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold line-clamp-1">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-xs text-muted-foreground">{item.variantName}: {item.variantValue}</p>
                            )}
                          </div>
                          <Button variant="ghost" className="text-destructive" onClick={() => { removeFromCart(item.productId, item.variantId); toast({ title: "Item dihapus", description: item.productName }); }}>
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => { updateQuantity(item.productId, item.quantity - 1, item.variantId); toast({ title: "Jumlah diubah", description: `${item.productName}: ${item.quantity - 1}` }); }}><Minus className="h-4 w-4"/></Button>
                          <Input value={item.quantity} onChange={(e)=>{
                            const v = parseInt(e.target.value)||1;
                            updateQuantity(item.productId, v, item.variantId);
                            toast({ title: "Jumlah diubah", description: `${item.productName}: ${v}` });
                          }} className="w-16 text-center" />
                          <Button size="icon" variant="outline" onClick={() => { updateQuantity(item.productId, item.quantity + 1, item.variantId); toast({ title: "Jumlah diubah", description: `${item.productName}: ${item.quantity + 1}` }); }}><Plus className="h-4 w-4"/></Button>
                          <span className="text-xs text-muted-foreground">Max: {item.maxStock}</span>
                        </div>

                        {item.enableNotes !== false && (
                          <div className="mt-3">
                            <Input
                              placeholder="Catatan (opsional)"
                              value={item.notes || ""}
                              onChange={(e)=>updateNotes(item.productId, e.target.value, item.variantId)}
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-right w-32">
                        <p className="text-xs text-muted-foreground">Subtotal</p>
                        <p className="font-semibold">Rp {(item.productPrice * item.quantity).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Item</span>
                    <span className="font-medium">{getCartCount()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" onClick={handleCheckout} disabled={getCartCount() === 0}>Checkout</Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/products">← Lanjut Belanja</Link>
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
