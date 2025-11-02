"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

// Fallback <img> untuk gambar produk jika komponen ImageWithFallback belum tersedia di proyek
function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src || "/placeholder.png"}
      alt={alt}
      className="w-16 h-16 object-cover rounded-lg border bg-white"
      loading="lazy"
    />
  );
}

interface Variant {
  id?: number;
  name: string;
  value: string;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  enableNotes?: boolean;
  variants: Variant[];
}

const Icons = {
  plus: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  edit: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  trash: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  ),
  layers: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  ),
  search: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
};

export default function ProductsManagement() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [managingProductVariants, setManagingProductVariants] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
    price: "",
    stock: "",
    status: "ACTIVE",
    enableNotes: true,
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({ name: "", value: "", stock: "" });

  // Toolbar
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?admin=true");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => (statusFilter === "ALL" ? true : p.status === statusFilter))
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [products, statusFilter, query]);

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", iconUrl: "", price: "", stock: "", status: "ACTIVE", enableNotes: true });
    setVariants([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      iconUrl: product.iconUrl || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status,
      enableNotes: product.enableNotes ?? true,
    });
    setVariants(product.variants || []);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addVariant = () => {
    if (!newVariant.name.trim() || !newVariant.value.trim()) return alert("Nama dan value variant harus diisi!");
    const isDuplicate = variants.some((v) => v.name.toLowerCase() === newVariant.name.toLowerCase() && v.value.toLowerCase() === newVariant.value.toLowerCase());
    if (isDuplicate) return alert("Variant dengan nama dan value ini sudah ada!");
    setVariants([...variants, { name: newVariant.name.trim(), value: newVariant.value.trim(), stock: parseInt(newVariant.stock) || 0 }]);
    setNewVariant({ name: "", value: "", stock: "" });
  };

  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariantStock = (index: number, newStock: number) => { const u = [...variants]; u[index].stock = newStock; setVariants(u); };

  const openVariantManager = (product: Product) => { setManagingProductVariants(product); setVariants(product.variants || []); setShowVariantModal(true); };

  const saveVariants = async () => {
    if (!managingProductVariants) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${managingProductVariants.id}/variants`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variants }) });
      if (res.ok) { await fetchProducts(); setShowVariantModal(false); setManagingProductVariants(null); }
    } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Nama produk wajib diisi!");
    if (!formData.price || isNaN(Number(formData.price))) return alert("Harga harus berupa angka!");
    if (!formData.stock || isNaN(Number(formData.stock))) return alert("Stok harus berupa angka!");

    setLoading(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        iconUrl: formData.iconUrl.trim(),
        price: formData.price,
        stock: formData.stock,
        status: formData.status,
        enableNotes: formData.enableNotes,
      };
      if (!editingProduct) {
        payload.variants = variants.map((v) => ({ name: v.name, value: v.value, stock: parseInt(v.stock.toString()) }));
      }

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return alert(`❌ Gagal menyimpan: ${res.status} - ${errorData.error || "Unknown error"}`);
      }

      await fetchProducts();
      setShowModal(false);
      resetForm();
      alert("✅ Produk berhasil disimpan!");
    } catch (error) { console.error("Submit error:", error); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header + Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Manajemen Produk</CardTitle>
              <CardDescription>Kelola katalog produk, harga, stok, dan variants</CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
              <Icons.plus className="w-4 h-4" /> Tambah Produk
            </Button>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:max-w-xs">
              <Input placeholder="Cari produk..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              <Icons.search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <ProductImage src={product.iconUrl} alt={product.name} />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600">{formatPrice(Number(product.price))}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Icons.layers className="w-4 h-4" /> {product.variants?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "ACTIVE" ? "success" : "destructive"}>{product.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {product.variants && product.variants.length > 0 && (
                          <Button variant="secondary" className="gap-2" onClick={() => openVariantManager(product)}>
                            <Icons.layers className="w-4 h-4" /> Variants ({product.variants.length})
                          </Button>
                        )}
                        <Button variant="outline" className="gap-2" onClick={() => handleEdit(product)}>
                          <Icons.edit className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="destructive" className="gap-2" onClick={() => handleDelete(product.id)}>
                          <Icons.trash className="w-4 h-4" /> Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Create/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? "Edit Produk" : "Tambah Produk"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Produk</label>
                <Input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL Gambar Produk</label>
                <Input type="text" placeholder="https://example.com/image.jpg" value={formData.iconUrl} onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Harga</label>
                  <Input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stok Utama</label>
                  <Input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded-lg p-3">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 mt-6">
                  <input type="checkbox" checked={formData.enableNotes} onChange={(e) => setFormData({ ...formData, enableNotes: e.target.checked })} className="w-5 h-5" />
                  <span>Aktifkan Kolom Catatan</span>
                </label>
              </div>

              {/* Variant Management inside create */}
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">Variants Produk</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input type="text" placeholder="Nama (Size, Color, dll)" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
                    <Input type="text" placeholder="Value (XL, Red, dll)" value={newVariant.value} onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })} />
                    <Input type="number" placeholder="Stok" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} />
                  </div>
                  <Button type="button" onClick={addVariant} className="w-full">Tambah Variant</Button>
                </div>
                {variants.length > 0 && (
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-3 rounded border">
                        <span className="flex-1"><strong>{variant.name}:</strong> {variant.value}</span>
                        <Input type="number" value={variant.stock} onChange={(e) => updateVariantStock(index, parseInt(e.target.value) || 0)} className="w-24" />
                        <Button type="button" variant="destructive" onClick={() => removeVariant(index)}>Hapus</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : editingProduct ? "Update" : "Simpan"}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Variant Manager */}
      {showVariantModal && managingProductVariants && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Kelola Variants: {managingProductVariants.name}</h2>
            <div className="space-y-3 mb-6">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-bold">{variant.name}: {variant.value}</p>
                    <p className="text-sm text-muted-foreground">Stok: {variant.stock}</p>
                  </div>
                  <Input type="number" value={variant.stock} onChange={(e) => updateVariantStock(index, parseInt(e.target.value) || 0)} className="w-24" />
                  <Button variant="destructive" onClick={() => removeVariant(index)}>Hapus</Button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={saveVariants} disabled={loading} className="flex-1">{loading ? "Saving..." : "Simpan Perubahan"}</Button>
              <Button variant="secondary" onClick={() => { setShowVariantModal(false); setManagingProductVariants(null); }}>Batal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
