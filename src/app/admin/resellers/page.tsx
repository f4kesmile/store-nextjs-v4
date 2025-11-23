"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AdminCard from "@/components/admin/shared/AdminCard";
import AdminTable from "@/components/admin/shared/AdminTable";
import {
  ActionDropdown,
  createCommonActions,
  FormGrid, // [FIX] Import FormGrid
} from "@/components/admin/shared/AdminComponents";
import AdminDialog from "@/components/admin/shared/AdminDialog"; // [FIX] Import AdminDialog
import { Label } from "@/components/ui/label"; // [FIX] Import Label
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, UserPlus, Copy, Check } from "lucide-react";
import { Reseller } from "@prisma/client"; // Import tipe Reseller

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    uniqueId: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resellers");
      if (res.ok) {
        setResellers(await res.json());
      } else {
        toast.error("Gagal memuat reseller");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const handleCreate = () => {
    setEditingReseller(null);
    setFormData({ name: "", whatsappNumber: "", uniqueId: "" });
    setShowModal(true);
  };

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setFormData({
      name: reseller.name,
      whatsappNumber: reseller.whatsappNumber,
      uniqueId: reseller.uniqueId,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus reseller ini?")) return;

    try {
      const res = await fetch(`/api/resellers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Reseller dihapus");
        fetchResellers();
      } else {
        toast.error("Gagal menghapus reseller");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingReseller
      ? `/api/resellers/${editingReseller.id}`
      : "/api/resellers";
    const method = editingReseller ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          editingReseller ? "Reseller diupdate" : "Reseller dibuat"
        );
        setShowModal(false);
        fetchResellers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Link reseller disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredResellers = useMemo(() => {
    return resellers.filter(
      (r) =>
        r.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        r.whatsappNumber.includes(searchValue) ||
        r.uniqueId.includes(searchValue)
    );
  }, [resellers, searchValue]);

  const columns = [
    { key: "name", label: "Nama" },
    { key: "whatsappNumber", label: "No. WhatsApp" },
    {
      key: "uniqueId",
      label: "Link Reseller",
      render: (uniqueId: string) => {
        const link = `${window.location.origin}?ref=${uniqueId}`;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(link)}
            className="gap-2"
          >
            {copiedId === link ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Salin Link
          </Button>
        );
      },
    },
    {
      key: "actions",
      label: "Aksi",
      className: "w-10",
      render: (_: any, reseller: Reseller) => (
        <ActionDropdown
          actions={createCommonActions.crud(
            undefined,
            () => handleEdit(reseller),
            () => handleDelete(reseller.id)
          )}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Reseller</h1>
            <p className="text-muted-foreground mt-1">
              Kelola semua reseller terdaftar
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <UserPlus className="w-4 h-4" /> Tambah Reseller
          </Button>
        </div>

        <AdminCard
          title="Semua Reseller"
          description={`${filteredResellers.length} reseller ditemukan`}
        >
          {/* Tampilan Tabel Desktop */}
          <div className="hidden md:block">
            <AdminTable
              columns={columns}
              data={filteredResellers}
              loading={loading}
              searchable
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Cari nama, No. WA, atau ID..."
            />
          </div>

          {/* Tampilan Card Mobile */}
          <div className="block md:hidden">
            <Input
              placeholder="Cari nama, No. WA..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="mb-4"
            />
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </Card>
                ))}
              </div>
            ) : filteredResellers.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                Reseller tidak ditemukan.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredResellers.map((reseller) => (
                  <Card key={reseller.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reseller.whatsappNumber}
                        </p>
                      </div>
                      <ActionDropdown
                        actions={createCommonActions.crud(
                          undefined,
                          () => handleEdit(reseller),
                          () => handleDelete(reseller.id)
                        )}
                      />
                    </div>
                    <div className="mt-3">
                      {columns[2].render!(reseller.uniqueId, reseller)}
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
          title={editingReseller ? "Edit Reseller" : "Reseller Baru"}
          description={
            editingReseller
              ? "Perbarui detail untuk reseller ini."
              : "Buat reseller baru untuk toko Anda."
          }
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
              <Button type="submit" form="reseller-form">
                Simpan
              </Button>
            </div>
          }
        >
          <form
            id="reseller-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormGrid columns={1}>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Reseller</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueId">ID Unik / Kode Referral</Label>
                <Input
                  id="uniqueId"
                  value={formData.uniqueId}
                  onChange={(e) =>
                    setFormData({ ...formData, uniqueId: e.target.value })
                  }
                  placeholder="Contoh: AGEN-JAKARTA-01"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Kode ini akan digunakan untuk link referral.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">No. WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  placeholder="628123456789"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Gunakan format internasional (cth: 628... bukan 08...).
                </p>
              </div>
            </FormGrid>
          </form>
        </AdminDialog>
      </div>
    </div>
  );
}
