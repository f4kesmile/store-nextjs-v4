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
  createCommonActions,
  FormGrid, // [FIX] Import FormGrid
} from "@/components/admin/shared/AdminComponents";
import AdminDialog from "@/components/admin/shared/AdminDialog"; // [FIX] Import AdminDialog
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
import { Download, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Tipe data berdasarkan Prisma schema Anda
interface Transaction {
  id: number;
  createdAt: string;
  product: { name: string } | null;
  variant: { name: string; value: string } | null;
  customerName: string | null;
  customerPhone: string | null;
  reseller: { name: string } | null;
  quantity: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  notes: string | null;
}

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
  });
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    status: "PENDING" as Transaction["status"],
    notes: "",
    customerName: "",
    customerPhone: "",
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Berhasil", {
          description: "Transaksi berhasil diupdate.",
        });
        setShowModal(false);
        setEditingTransaction(null);
        fetchTransactions();
      } else {
        toast.error("Gagal", {
          description: "Gagal mengupdate transaksi.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Terjadi kesalahan.",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil", { description: "Transaksi dihapus." });
        fetchTransactions();
      } else {
        toast.error("Gagal", {
          description: "Gagal menghapus transaksi.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Terjadi kesalahan.",
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => filterStatus === "all" || t.status === filterStatus)
      .filter((t) => {
        const searchLower = searchValue.toLowerCase();
        return (
          t.id.toString().includes(searchLower) ||
          (t.product?.name &&
            t.product.name.toLowerCase().includes(searchLower)) ||
          (t.customerName &&
            t.customerName.toLowerCase().includes(searchLower)) ||
          (t.customerPhone &&
            t.customerPhone.toLowerCase().includes(searchLower)) ||
          (t.reseller && t.reseller.name.toLowerCase().includes(searchLower))
        );
      });
  }, [transactions, searchValue, filterStatus]);

  const getStatusBadgeVariant = (status: Transaction["status"]) => {
    if (status === "PENDING") return "warning" as const;
    if (status === "CONFIRMED" || status === "SHIPPED") return "info" as const;
    if (status === "COMPLETED") return "success" as const;
    if (status === "CANCELLED") return "danger" as const;
    return "secondary" as const;
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (id: number) => <span className="font-mono text-sm">#{id}</span>,
    },
    {
      key: "createdAt",
      label: "Tanggal",
      render: (date: string) => (
        <div className="text-sm">{formatDate(date)}</div>
      ),
    },
    {
      key: "product",
      label: "Produk",
      render: (_: any, t: Transaction) => (
        <div>
          <div className="font-medium">{t.product?.name}</div>
          {t.variant && (
            <div className="text-xs text-muted-foreground">
              {t.variant.name}: {t.variant.value}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (_: any, t: Transaction) => (
        <div>
          <div className="text-sm">{t.customerName || "-"}</div>
          <div className="text-xs text-muted-foreground">
            {t.customerPhone || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "reseller",
      label: "Reseller",
      render: (reseller: { name: string } | null) => (
        <Badge variant={reseller ? "secondary" : "outline"}>
          {reseller?.name || "Direct"}
        </Badge>
      ),
    },
    { key: "quantity", label: "Qty", className: "text-center" },
    {
      key: "totalPrice",
      label: "Total",
      render: (price: number) => (
        <span className="font-semibold text-emerald-500">
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
      render: (_: any, t: Transaction) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit",
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
            {
              label: "Hapus",
              onClick: () => handleDeleteTransaction(t.id),
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transaksi</h1>
            <p className="text-muted-foreground mt-1">
              Kelola semua transaksi penjualan
            </p>
          </div>
          <TransactionExportButton />
        </div>

        <AdminCard
          title="Semua Transaksi"
          description={`${filteredTransactions.length} transaksi ditemukan`}
        >
          {/* Tampilan Tabel Desktop */}
          <div className="hidden md:block">
            <AdminTable
              columns={columns}
              data={filteredTransactions}
              loading={loading}
              searchable
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Cari ID, produk, customer..."
              emptyMessage="Transaksi tidak ditemukan"
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

          {/* Tampilan Card Mobile */}
          <div className="block md:hidden">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Cari ID, produk..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
              />
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
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </Card>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                Transaksi tidak ditemukan.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((t) => (
                  <Card key={t.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          #{t.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                      <ActionDropdown
                        actions={[
                          {
                            label: "Edit",
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
                          {
                            label: "Hapus",
                            onClick: () => handleDeleteTransaction(t.id),
                            variant: "destructive",
                          },
                        ]}
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="font-medium truncate">
                        {t.product?.name || "Produk Dihapus"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.customerName || "-"}
                      </p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-semibold text-primary">
                          {formatPrice(Number(t.totalPrice))}
                        </span>
                        <Badge variant={getStatusBadgeVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </AdminCard>

        {/* [FIX] Mengganti modal manual dengan AdminDialog */}
        <AdminDialog
          open={showModal}
          onOpenChange={setShowModal}
          title={`Edit Transaksi #${editingTransaction?.id}`}
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
                <Label htmlFor="status">Status</Label>
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
                <Label htmlFor="customerName">Nama Customer</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      customerName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telepon Customer</Label>
                <Input
                  id="customerPhone"
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
                <Label htmlFor="notes">Catatan Admin</Label>
                <Textarea
                  id="notes"
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
