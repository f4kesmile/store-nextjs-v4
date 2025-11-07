"use client";
import { useState } from "react";
import AdminDialog from "@/components/admin/shared/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TransactionEditDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  // State dummy untuk form
  const [formData, setFormData] = useState({
    customerName: "IHZA ADITYA",
    customerPhone: "083804568711",
    status: "PENDING",
    notes: "Catatan pengiriman.",
    total: "Rp 2.500.000",
  });

  // KELAS PERBAIKAN: Memastikan input terlihat gelap di dark mode Admin
  // Ini akan membuat background input menjadi '--accent' (yang lebih gelap) ketika tema gelap aktif.
  const inputOverrideClass = cn(
    "dark:bg-[hsl(var(--accent))] dark:border-[hsl(var(--border))]",
    "dark:text-[hsl(var(--foreground))]"
  );

  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit Transaksi #${orderId}`}
      description="Ubah status, data pelanggan, dan catatan admin."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              /* Lakukan logic save di sini */ onOpenChange(false);
            }}
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData((f) => ({ ...f, status: v }))}
          >
            {/* Terapkan override pada SelectTrigger */}
            <SelectTrigger id="status" className={inputOverrideClass}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="name">Nama Customer</Label>
          <Input
            id="name"
            placeholder="Nama Customer"
            value={formData.customerName}
            onChange={(e) =>
              setFormData((f) => ({ ...f, customerName: e.target.value }))
            }
            className={inputOverrideClass}
          />

          <Label htmlFor="phone">Telepon Customer</Label>
          <Input
            id="phone"
            placeholder="Email/No. Telp"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData((f) => ({ ...f, customerPhone: e.target.value }))
            }
            className={inputOverrideClass}
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="total">Total (Rp)</Label>
          <Input
            id="total"
            placeholder="Total (Rp)"
            value={formData.total}
            onChange={(e) =>
              setFormData((f) => ({ ...f, total: e.target.value }))
            }
            className={inputOverrideClass}
          />

          <Label htmlFor="notes">Catatan Admin</Label>
          <Textarea
            id="notes"
            placeholder="Catatan"
            rows={5}
            value={formData.notes}
            onChange={(e) =>
              setFormData((f) => ({ ...f, notes: e.target.value }))
            }
            className={inputOverrideClass}
          />
        </div>
      </div>
    </AdminDialog>
  );
}
