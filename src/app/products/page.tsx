"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Variant { id: number; name: string; value: string; stock: number; }
interface Product { id: number; name: string; description: string; iconUrl: string; price: number; stock: number; status: string; enableNotes: boolean; variants: Variant[]; }

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
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.status === "ACTIVE");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === "price_asc") list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a,b) => b.price - a.price);
    return list;
  }, [products, query, sort]);

  const openProduct = (id: number) => router.push(`/products/${id}`);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <ShoppingCart className="h-6 w-6"/> Produk Kami
          </h1>
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Cari produk..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64"
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Terbaru</SelectItem>
                <SelectItem value="price_asc">Harga: Rendah → Tinggi</SelectItem>
                <SelectItem value="price_desc">Harga: Tinggi → Rendah</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" asChild>
              <Link href="/cart">Keranjang ({getCartCount()})</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => {
              const hasStock = product.stock > 0 || product.variants.some(v => v.stock > 0);
              return (
                <Card key={product.id} className={hasStock ? "" : "opacity-60"}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-muted/40 rounded-md flex items-center justify-center mb-3 overflow-hidden">
                      {product.iconUrl 
                        ? <img src={product.iconUrl} alt={product.name} className="max-h-36 object-contain" /> 
                        : <Info className="h-10 w-10 text-muted-foreground"/>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    {product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.variants.slice(0,3).map(v => (
                          <Badge key={v.id} variant={v.stock>0?"secondary":"outline"} className={v.stock>0?"":"line-through opacity-60"}>{v.value}</Badge>
                        ))}
                        {product.variants.length>3 && (
                          <Badge variant="outline">+{product.variants.length-3}</Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">Rp {product.price.toLocaleString("id-ID")}</span>
                      <span className="text-xs text-muted-foreground">{hasStock?`Stok: ${product.stock}`:"Habis"}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2 w-full">
                      <Button className="flex-1" onClick={() => openProduct(product.id)} disabled={!hasStock}>
                        Detail
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => {
                        if (!hasStock) return;
                        addToCart({
                          productId: product.id,
                          productName: product.name,
                          productPrice: product.price,
                          productImage: product.iconUrl,
                          quantity: 1,
                          maxStock: Math.max(product.stock, ...product.variants.map(v=>v.stock||0)),
                          enableNotes: product.enableNotes,
                        });
                        toast({ title: "Ditambahkan", description: `${product.name} (x1) ke keranjang` });
                      }} disabled={!hasStock}>
                        + Keranjang
                      </Button>
                    </div>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
