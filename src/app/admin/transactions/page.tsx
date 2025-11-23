"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AdminCard from "@/components/admin/shared/AdminCard";
import AdminTable from "@/components/admin/shared/AdminTable";
import {
  ActionDropdown,
  FormGrid,
} from "@/components/admin/shared/AdminComponents";
import AdminDialog from "@/components/admin/shared/AdminDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TransactionExportButton from "@/components/TransactionExportButton";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --- TIPE DATA ---

interface Transaction {
  id: number;
  orderId?: string | null; // Tambahkan orderId
  createdAt: string;
  product: { name: string; images?: string[] } | null;
  variant: { name: string; value: string } | null;
  customerName: string | null;
  customerPhone: string | null;
  reseller: { name: string } | null;
  quantity: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  notes: string | null;
}

// Interface baru untuk data yang sudah dikelompokkan
export interface GroupedTransaction extends Transaction {
  items: Transaction[]; // List semua barang dalam order ini
  totalOrderPrice: number; // Total harga gabungan
}

// --- HELPER FUNCTIONS ---

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeVariant = (status: Transaction["status"]) => {
  if (status === "PENDING") return "warning" as const;
  if (status === "CONFIRMED" || status === "SHIPPED") return "info" as const;
  if (status === "COMPLETED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "secondary" as const;
};

// --- KOMPONEN UTAMA ---

export default function TransactionsPage() {
  const [groupedTransactions, setGroupedTransactions] = useState<
    GroupedTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<GroupedTransaction | null>(null);

  const [formData, setFormData] = useState({
    status: "PENDING" as Transaction["status"],
    notes: "",
    customerName: "",
    customerPhone: "",
  });

  // 1. FUNGSI FETCH & GROUPING (BAGIAN PENTING)
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data: Transaction[] = await res.json();
        processData(data); // Panggil fungsi grouping
      } else {
        toast.error("Gagal memuat transaksi");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Logika Pengelompokan Data berdasarkan Order ID
  const processData = (transactions: Transaction[]) => {
    const groups: { [key: string]: GroupedTransaction } = {};
    const legacyTransactions: GroupedTransaction[] = [];

    transactions.forEach((trx) => {
      // Jika tidak punya Order ID (transaksi lama), pisahkan
      const numericPrice = Number(trx.totalPrice);
      if (!trx.orderId) {
        legacyTransactions.push({
          ...trx,
          items: [trx],
          totalOrderPrice: numericPrice,
        });
        return;
      }

      // Jika Order ID sudah ada, tambahkan item ke grup tersebut
      if (groups[trx.orderId]) {
        groups[trx.orderId].items.push(trx);
        groups[trx.orderId].totalOrderPrice += numericPrice;
      } else {
        // Buat grup baru
        groups[trx.orderId] = {
          ...trx,
          items: [trx],
          totalOrderPrice: numericPrice,
        };
      }
    });

    // Gabungkan dan urutkan dari yang terbaru
    const combined = [...Object.values(groups), ...legacyTransactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setGroupedTransactions(combined);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. FUNGSI UPDATE & DELETE
  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    // Kita update menggunakan ID transaksi pertama dalam grup
    // (Idealnya backend punya endpoint update by OrderID, tapi ini workaround)
    try {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Berhasil diupdate");
        setShowModal(false);
        setEditingTransaction(null);
        fetchTransactions();
      } else {
        toast.error("Gagal update");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Dihapus");
        fetchTransactions();
      } else {
        toast.error("Gagal hapus");
      }
    } catch (error) {
      toast.error("Error");
    }
  };

  // 3. FILTERING PADA DATA YANG SUDAH DI-GROUP
  const filteredData = useMemo(() => {
    return groupedTransactions
      .filter((t) => filterStatus === "all" || t.status === filterStatus)
      .filter((t) => {
        const searchLower = searchValue.toLowerCase();
        // Cek ID Utama
        if (t.orderId?.toLowerCase().includes(searchLower)) return true;
        if (t.customerName?.toLowerCase().includes(searchLower)) return true;

        // Cek Nama Produk di dalam Items
        const hasProduct = t.items.some((item) =>
          item.product?.name.toLowerCase().includes(searchLower)
        );
        return hasProduct;
      });
  }, [groupedTransactions, searchValue, filterStatus]);

  // 4. DEFINISI KOLOM TABEL (MODIFIKASI TAMPILAN)
  const columns = [
    {
      key: "orderId",
      label: "Order Info",
      render: (_: any, row: GroupedTransaction) => (
        <div>
          <div className="font-mono text-xs font-bold text-primary">
            {row.orderId || (
              <span className="text-muted-foreground italic">Legacy</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "items", // Virtual Key
      label: "Daftar Produk",
      className: "min-w-[300px]",
      render: (_: any, row: GroupedTransaction) => (
        <div className="space-y-3 py-1">
          {row.items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 text-sm ${
                index !== row.items.length - 1
                  ? "border-b border-border/40 pb-2"
                  : ""
              }`}
            >
              {/* Jika ada gambar produk (opsional) */}
              {/* <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0" /> */}

              <div className="flex-1">
                <p className="font-medium text-sm leading-tight">
                  {item.product?.name || "Produk Dihapus"}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.variant && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5"
                    >
                      {item.variant.name}: {item.variant.value}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    x{item.quantity}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer & Reseller",
      render: (_: any, t: GroupedTransaction) => (
        <div className="space-y-1">
          <div>
            <div className="font-medium text-sm">
              {t.customerName || "Tanpa Nama"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.customerPhone || "-"}
            </div>
          </div>
          {t.reseller && (
            <Badge variant="outline" className="mt-1 text-[10px]">
              Via: {t.reseller.name}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "totalOrderPrice",
      label: "Total Order",
      render: (price: number) => (
        <span className="font-bold text-emerald-500 text-sm">
          {formatPrice(price)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: Transaction["status"]) => (
        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      className: "w-10",
      render: (_: any, t: GroupedTransaction) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit Status",
              onClick: () => {
                setEditingTransaction(t);
                setFormData({
                  status: t.status,
                  notes: t.notes || "",
                  customerName: t.customerName || "",
                  customerPhone: t.customerPhone || "",
                });
                setShowModal(true);
              },
            },
            // Note: Hapus mungkin hanya menghapus 1 item jika API belum support Order ID
            // {
            //   label: "Hapus",
            //   onClick: () => handleDeleteTransaction(t.id),
            //   variant: "destructive",
            // },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Page */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transaksi</h1>
            <p className="text-muted-foreground mt-1">
              Kelola semua pesanan masuk
            </p>
          </div>
          <TransactionExportButton />
        </div>

        <AdminCard
          title="Riwayat Pesanan"
          description={`${filteredData.length} pesanan ditemukan`}
        >
          {/* Tampilan Desktop */}
          <div className="hidden md:block">
            <AdminTable
              columns={columns}
              data={filteredData} // Gunakan data yang sudah di-group
              loading={loading}
              searchable
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Cari Order ID, Nama Produk, Customer..."
              filters={
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </div>

          {/* Tampilan Mobile (Kartu) */}
          <div className="block md:hidden space-y-4">
            {/* Search Mobile */}
            <div className="flex gap-2">
              <Input
                placeholder="Cari..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              filteredData.map((t) => (
                <Card key={t.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs font-bold text-primary">
                        {t.orderId || "LEGACY"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(t.status)}>
                      {t.status}
                    </Badge>
                  </div>

                  {/* List Item Mobile */}
                  <div className="border-t border-b py-2 space-y-2">
                    {t.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.product?.name}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-medium">{t.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold text-emerald-500">
                        {formatPrice(t.totalOrderPrice)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditingTransaction(t);
                      setFormData({
                        status: t.status,
                        notes: t.notes || "",
                        customerName: t.customerName || "",
                        customerPhone: t.customerPhone || "",
                      });
                      setShowModal(true);
                    }}
                  >
                    Edit Status
                  </Button>
                </Card>
              ))
            )}
          </div>
        </AdminCard>

        {/* Modal Edit */}
        <AdminDialog
          open={showModal}
          onOpenChange={setShowModal}
          title={`Edit Order ${
            editingTransaction?.orderId || editingTransaction?.id
          }`}
          size="md"
          footer={
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" form="edit-transaction-form">
                Simpan
              </Button>
            </div>
          }
        >
          <form
            id="edit-transaction-form"
            onSubmit={handleUpdateTransaction}
            className="space-y-4"
          >
            <FormGrid columns={1}>
              <div className="space-y-2">
                <Label htmlFor="status">Status Pesanan</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData((f) => ({
                      ...f,
                      status: v as Transaction["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama Customer</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, customerName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      customerPhone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </FormGrid>
          </form>
        </AdminDialog>
      </div>
    </div>
  );
}
