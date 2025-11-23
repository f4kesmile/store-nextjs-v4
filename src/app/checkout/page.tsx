"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useReseller } from "@/contexts/ResellerContext";
import { toast } from "sonner";
import {
  ShoppingCart,
  CreditCard,
  Smartphone,
  Building2,
  User,
} from "lucide-react";

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

function CheckoutContent() {
  const { cart, getCartTotal, getCartCount, clearCart } = useCart();
  const { lockedRef, activeResellerData } = useReseller();
  const router = useRouter();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "gateway">(
    "whatsapp"
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const activeReseller = activeResellerData;
  const total = getCartTotal();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push(lockedRef ? `/products?ref=${lockedRef}` : "/products");
    }
  }, [cart.length, router, lockedRef]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.name.trim()) newErrors.name = "Nama harus diisi";
    if (!customerInfo.phone.trim()) newErrors.phone = "No. telepon harus diisi";
    if (!customerInfo.address.trim()) newErrors.address = "Alamat harus diisi";
    if (!customerInfo.city.trim()) newErrors.city = "Kota harus diisi";

    if (
      customerInfo.phone &&
      !/^[+]?[0-9]{10,15}$/.test(customerInfo.phone.replace(/[\s-]/g, ""))
    ) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // === BAGIAN INI TELAH DIPERBAIKI ===
  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // PERUBAHAN: Kirim 1 Request berisi SEMUA items (tanpa loop map)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart, // Mengirim seluruh array cart
          resellerId: lockedRef || null,
          customerInfo, // Data customer termasuk global notes
        }),
      });

      const data = await response.json();

      if (response.ok && data.whatsappUrl) {
        clearCart();
        toast.success("Pesanan berhasil dibuat, mengarahkan ke WhatsApp...");

        // Redirect ke URL WhatsApp yang berisi gabungan pesanan
        window.location.href = data.whatsappUrl;
      } else {
        // Handle error dari server
        toast.error(
          data.error || "Gagal membuat pesanan. Cek stok atau coba lagi."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Gagal memproses pesanan (Connection Error)");
      setLoading(false);
    }
  };
  // ===================================

  const handlePaymentGateway = async () => {
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    // TODO: Implement payment gateway integration
    toast.info("Payment Gateway akan segera tersedia!");
  };

  if (cart.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-8">
            Tidak ada produk untuk di-checkout
          </p>
          <Button
            onClick={() =>
              router.push(
                lockedRef ? `/products?ref=${lockedRef}` : "/products"
              )
            }
          >
            Mulai Belanja
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeader
          title="Checkout"
          description={`${getCartCount()} item dalam keranjang`}
        />

        {/* Reseller Info Banner */}
        {activeReseller && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Building2 className="h-5 w-5" />
                <span className="font-medium">
                  Pesanan via Reseller: {activeReseller.name}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                >
                  {lockedRef}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">No. Telepon *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="08xxxxxxxxxx"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com (opsional)"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={errors.address ? "border-red-500" : ""}
                    placeholder="Jalan, No. Rumah, RT/RW"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Kota *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className={errors.city ? "border-red-500" : ""}
                      placeholder="Nama kota"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      value={customerInfo.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      placeholder="12345 (opsional)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Pesanan</Label>
                  <Input
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Catatan tambahan untuk pesanan (opsional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "whatsapp"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/50"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => setPaymentMethod("whatsapp")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium">WhatsApp Order</p>
                          <p className="text-sm text-muted-foreground">
                            Pesan langsung via WhatsApp{" "}
                            {activeReseller ? "reseller" : "toko"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === "whatsapp"
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors opacity-50 ${
                      paymentMethod === "gateway"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                        : "border-border"
                    }`}
                    onClick={() =>
                      toast.info("Payment Gateway akan segera tersedia!")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium">Payment Gateway</p>
                          <p className="text-sm text-muted-foreground">
                            Transfer Bank, E-wallet, dll (Segera hadir)
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === "gateway"
                            ? "border-blue-500 bg-blue-500"
                            : "border-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-3"
                    >
                      <img
                        src={
                          item.productImage || "https://via.placeholder.com/60"
                        }
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">
                            {item.variantName}: {item.variantValue}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">
                            ×{item.quantity}
                          </span>
                          <span className="text-sm font-medium">
                            Rp{" "}
                            {(item.productPrice * item.quantity).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({getCartCount()} item)
                    </span>
                    <span>Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  {paymentMethod === "whatsapp" ? (
                    <Button
                      onClick={handleWhatsAppCheckout}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Pesan via WhatsApp
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePaymentGateway}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bayar Sekarang
                      </span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => router.push("/cart")}
                    className="w-full"
                  >
                    ← Kembali ke Keranjang
                  </Button>
                </div>

                {activeReseller && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    💡 Pesanan akan diproses melalui {activeReseller.name}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="container mx-auto px-4 py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading checkout...</p>
          </div>
        </PageLayout>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
