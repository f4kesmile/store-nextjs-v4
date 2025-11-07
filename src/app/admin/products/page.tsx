"use client";

import React, { useMemo, useState, useEffect } from "react";
import AdminCard from "@/components/admin/shared/AdminCard";
import AdminDialog from "@/components/admin/shared/AdminDialog";
import AdminTable from "@/components/admin/shared/AdminTable";
import {
  StatusBadge,
  ActionDropdown,
  FormGrid,
  createCommonActions,
} from "@/components/admin/shared/AdminComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Package2,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  Trash2, // <-- IMPORT BARU
  Database, // <-- IMPORT BARU
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ImageWithFallback from "@/components/ImageWithFallback";
// --- IMPORT BARU UNTUK TABS ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge"; // <-- IMPORT BARU

// --- INTERFACE DIPERBARUI ---
interface Variant {
  id?: number; // Opsional, karena bisa jadi varian baru
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
  description: string | null;
  iconUrl: string | null;
  images: ProductImage[];
  variants: Variant[]; // Tambahan untuk varian
  stock: number;
  price: number;
  status: "ACTIVE" | "INACTIVE";
  enableNotes: boolean;
  createdAt: string;
}

type ProductFormData = Partial<Omit<Product, "images" | "variants">> & {
  galleryUrls?: string[];
  variants?: Variant[];
};
// -----------------------------

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductFormData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // <-- State saving baru

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?admin=true");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Gagal memuat produk");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = () => {
    setSelectedProduct({
      name: "",
      description: "",
      iconUrl: "",
      galleryUrls: [],
      variants: [], // <-- Tambahkan varian kosong
      price: 0,
      stock: 0,
      status: "ACTIVE",
      enableNotes: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct({
      ...product,
      galleryUrls: product.images.map((img) => img.url),
      variants: product.variants || [], // <-- Isi varian dari produk
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Anda yakin ingin menghapus produk ${product.name}?`)) {
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Produk dihapus");
          fetchProducts();
        } else {
          toast.error("Gagal menghapus produk");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan");
      }
    }
  };

  // --- LOGIKA PENYIMPANAN DIPERBARUI ---
  const handleSaveProduct = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);

    const isCreateMode = !selectedProduct.id;
    const url = isCreateMode
      ? "/api/products"
      : `/api/products/${selectedProduct.id}`;
    const method = isCreateMode ? "POST" : "PUT";

    // Payload untuk Info Utama
    const mainPayload = {
      name: selectedProduct.name,
      description: selectedProduct.description,
      iconUrl: selectedProduct.iconUrl,
      price: parseFloat(String(selectedProduct.price)) || 0,
      stock: parseInt(String(selectedProduct.stock)) || 0,
      status: selectedProduct.status,
      enableNotes: selectedProduct.enableNotes,
      images: selectedProduct.galleryUrls || [],
      // Jika mode CREATE, API Anda mendukung pengiriman varian secara langsung
      ...(isCreateMode && { variants: selectedProduct.variants || [] }),
    };

    try {
      // --- STEP 1: Simpan Info Utama (atau Buat Produk Baru) ---
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mainPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan produk");
      }

      const savedProduct = await res.json();

      // --- STEP 2: Jika Edit, Simpan Varian Terpisah ---
      // Kita gunakan API varian yang sudah ada/variants/route.ts]
      if (!isCreateMode) {
        const variantRes = await fetch(
          `/api/products/${savedProduct.id}/variants`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variants: selectedProduct.variants || [] }),
          }
        );

        if (!variantRes.ok) {
          throw new Error("Info produk disimpan, tapi gagal menyimpan varian.");
        }
      }

      toast.success(isCreateMode ? "Produk dibuat" : "Produk diperbarui");
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error("Gagal menyimpan", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  // ------------------------------------

  const handleDialogChange = (field: keyof ProductFormData, value: any) => {
    setSelectedProduct((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // --- FUNGSI BARU UNTUK MENGELOLA VARIAN ---
  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setSelectedProduct((prev) => {
      if (!prev || !prev.variants) return prev;
      const newVariants = [...prev.variants];
      const targetVariant = { ...newVariants[index] };

      // Konversi ke angka jika field-nya adalah 'stock'
      if (field === "stock") {
        targetVariant[field] = parseInt(String(value)) || 0;
      } else {
        (targetVariant as any)[field] = value;
      }

      newVariants[index] = targetVariant;
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setSelectedProduct((prev) => ({
      ...prev,
      variants: [
        ...(prev?.variants || []),
        { name: "Ukuran", value: "Default", stock: 0 },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setSelectedProduct((prev) => ({
      ...prev,
      variants: prev?.variants?.filter((_, i) => i !== index),
    }));
  };
  // ----------------------------------------

  // Upload untuk Icon Utama (Single)
  const handleIconUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Gagal upload");
      const data = await res.json();
      handleDialogChange("iconUrl", data.imageUrl);
      toast.success("Cover berhasil diupload");
    } catch (error) {
      toast.error("Upload cover gagal");
    } finally {
      setUploadingIcon(false);
      event.target.value = "";
    }
  };

  // Upload untuk Galeri (Multiple)
  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.imageUrl);
        }
      }

      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              galleryUrls: [...(prev.galleryUrls || []), ...newUrls],
            }
          : null
      );

      if (newUrls.length > 0)
        toast.success(`${newUrls.length} gambar ditambahkan ke galeri`);
    } catch (error) {
      toast.error("Sebagian upload galeri gagal");
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setSelectedProduct((prev) =>
      prev
        ? {
            ...prev,
            galleryUrls: prev.galleryUrls?.filter(
              (_, index) => index !== indexToRemove
            ),
          }
        : null
    );
  };

  const isUploading = uploadingIcon || uploadingGallery;
  const isBusy = isUploading || isSaving; // Gabungkan state loading

  const getStockStatus = (stock: number) =>
    stock === 0 ? "out_of_stock" : stock < 10 ? "low_stock" : "in_stock";
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const columns = [
    {
      key: "name",
      label: "Produk",
      render: (value: string, product: Product) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-muted shrink-0">
            <ImageWithFallback
              src={product.iconUrl}
              alt={product.name}
              fill={true}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-[hsl(var(--foreground))] line-clamp-1">
              {value}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              ID: {product.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (v: number) => (
        <span className="font-medium">{formatRupiah(v)}</span>
      ),
    },
    // --- KOLOM STOK DIPERBARUI ---
    {
      key: "stock",
      label: "Stok",
      render: (v: number, product: Product) => {
        // Jika ada varian, hitung total stok varian
        if (product.variants && product.variants.length > 0) {
          const totalVariantStock = product.variants.reduce(
            (acc, v) => acc + v.stock,
            0
          );
          return (
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{totalVariantStock}</span>
              <Badge variant="outline">{product.variants.length} Varian</Badge>
            </div>
          );
        }
        // Tampilan stok normal jika tidak ada varian
        return (
          <div className="flex items-center gap-2">
            <Package2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{v}</span>
            <StatusBadge status={getStockStatus(v)} />
          </div>
        );
      },
    },
    // ----------------------------
    {
      key: "status",
      label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "createdAt",
      label: "Dibuat",
      className: "hidden lg:table-cell",
      render: (v: string) => (
        <span className="text-sm text-muted-foreground">{formatDate(v)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (_: any, p: Product) => (
        <ActionDropdown
          actions={createCommonActions.crud(
            undefined,
            () => handleEditProduct(p),
            () => handleDeleteProduct(p)
          )}
        />
      ),
    },
  ];

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        [p.name].some((x) =>
          x.toLowerCase().includes(searchValue.toLowerCase())
        )
      ),
    [products, searchValue]
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Produk</h1>
          <Button onClick={handleCreateProduct} className="gap-2">
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        </div>

        <AdminCard
          title="Semua Produk"
          description={`${filteredProducts.length} produk ditemukan`}
        >
          <AdminTable
            columns={columns}
            data={filteredProducts}
            loading={loading}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Cari produk..."
          />
        </AdminCard>

        {/* --- DIALOG DIMODIFIKASI DENGAN TABS --- */}
        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={!selectedProduct?.id ? "Produk Baru" : "Edit Produk"}
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isBusy}
              >
                Batal
              </Button>
              <Button onClick={handleSaveProduct} disabled={isBusy}>
                {isSaving
                  ? "Menyimpan..."
                  : isUploading
                  ? "Mengupload..."
                  : "Simpan"}
              </Button>
            </div>
          }
        >
          {selectedProduct && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Informasi Utama</TabsTrigger>
                <TabsTrigger value="variants">Varian Produk</TabsTrigger>
              </TabsList>

              {/* TAB 1: INFORMASI UTAMA */}
              <TabsContent value="info">
                <FormGrid columns={2}>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nama Produk</Label>
                    <Input
                      value={selectedProduct.name || ""}
                      onChange={(e) =>
                        handleDialogChange("name", e.target.value)
                      }
                      disabled={isBusy}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Deskripsi</Label>
                    <Textarea
                      rows={3}
                      value={selectedProduct.description || ""}
                      onChange={(e) =>
                        handleDialogChange("description", e.target.value)
                      }
                      disabled={isBusy}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Utama</Label>
                    {/* ... (Kode upload cover tetap sama) ... */}
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0 border">
                        {selectedProduct.iconUrl ? (
                          <img
                            src={selectedProduct.iconUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="w-full space-y-2">
                        <Input
                          value={selectedProduct.iconUrl || ""}
                          onChange={(e) =>
                            handleDialogChange("iconUrl", e.target.value)
                          }
                          placeholder="URL Cover"
                          disabled={isBusy}
                        />
                        <div className="flex gap-2">
                          <Input
                            id="icon-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleIconUpload}
                            disabled={isBusy}
                            className="hidden"
                          />
                          <Label
                            htmlFor="icon-upload"
                            className={cn(
                              "inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-xs font-medium transition-colors hover:bg-accent cursor-pointer gap-2",
                              isBusy && "opacity-50"
                            )}
                          >
                            {uploadingIcon ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}{" "}
                            Upload Cover
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Galeri ({selectedProduct.galleryUrls?.length || 0})
                    </Label>
                    {/* ... (Kode upload galeri tetap sama) ... */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          disabled={isBusy}
                          className="hidden"
                        />
                        <Label
                          htmlFor="gallery-upload"
                          className={cn(
                            "inline-flex h-9 items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 px-4 text-xs font-medium text-primary transition-colors hover:bg-primary/10 cursor-pointer gap-2 w-full",
                            isBusy && "opacity-50"
                          )}
                        >
                          {uploadingGallery ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}{" "}
                          Tambah Gambar Galeri
                        </Label>
                      </div>
                      {selectedProduct.galleryUrls &&
                      selectedProduct.galleryUrls.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProduct.galleryUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative group aspect-square bg-muted rounded-md overflow-hidden border"
                            >
                              <img
                                src={url}
                                alt={`Galeri ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeGalleryImage(idx)}
                                type="button"
                                disabled={isBusy}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md">
                          Belum ada gambar galeri
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Harga (IDR)</Label>
                    <Input
                      type="number"
                      value={selectedProduct.price || 0}
                      onChange={(e) =>
                        handleDialogChange("price", parseFloat(e.target.value))
                      }
                      disabled={isBusy}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stok Utama</Label>
                    <Input
                      type="number"
                      value={selectedProduct.stock || 0}
                      onChange={(e) =>
                        handleDialogChange("stock", parseInt(e.target.value))
                      }
                      disabled={
                        isBusy || (selectedProduct.variants?.length || 0) > 0
                      }
                    />
                    {(selectedProduct.variants?.length || 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Stok utama dinonaktifkan karena produk ini memiliki
                        varian.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={selectedProduct.status || "ACTIVE"}
                      onValueChange={(v) => handleDialogChange("status", v)}
                      disabled={isBusy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Catatan Pembeli</Label>
                    <Select
                      value={selectedProduct.enableNotes ? "true" : "false"}
                      onValueChange={(v) =>
                        handleDialogChange("enableNotes", v === "true")
                      }
                      disabled={isBusy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Aktif</SelectItem>
                        <SelectItem value="false">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormGrid>
              </TabsContent>

              {/* TAB 2: VARIAN PRODUK */}
              <TabsContent value="variants">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Label className="text-base">Daftar Varian</Label>
                      <p className="text-sm text-muted-foreground">
                        Kelola nama, nilai, dan stok untuk tiap varian.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                      disabled={isBusy}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Varian
                    </Button>
                  </div>

                  {(selectedProduct.variants?.length || 0) === 0 ? (
                    <div className="text-center text-muted-foreground py-10 border border-dashed rounded-md">
                      Belum ada varian.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {selectedProduct.variants?.map((variant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md"
                        >
                          <div className="col-span-4 space-y-1">
                            <Label htmlFor={`v-name-${index}`}>Nama</Label>
                            <Input
                              id={`v-name-${index}`}
                              placeholder="Cth: Warna"
                              value={variant.name}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              disabled={isBusy}
                            />
                          </div>
                          <div className="col-span-4 space-y-1">
                            <Label htmlFor={`v-value-${index}`}>Nilai</Label>
                            <Input
                              id={`v-value-${index}`}
                              placeholder="Cth: Merah"
                              value={variant.value}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              disabled={isBusy}
                            />
                          </div>
                          <div className="col-span-3 space-y-1">
                            <Label htmlFor={`v-stock-${index}`}>Stok</Label>
                            <Input
                              id={`v-stock-${index}`}
                              type="number"
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "stock",
                                  e.target.value
                                )
                              }
                              disabled={isBusy}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeVariant(index)}
                              disabled={isBusy}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </AdminDialog>
        {/* ------------------------------------ */}
      </div>
    </div>
  );
};

export default ProductsPage;
