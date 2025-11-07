"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const IconUser = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20a6 6 0 0112 0" />
  </svg>
);
const Icons = {
  plus: (p: any) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...p}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  edit: (p: any) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...p}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  trash: (p: any) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...p}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  ),
};

interface Reseller {
  id: number;
  name: string;
  whatsappNumber: string;
  uniqueId: string;
  createdAt: string;
}

export default function ResellersManagement() {
  const { data: session } = useSession();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    uniqueId: "",
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchResellers();
  }, []);
  const fetchResellers = async () => {
    try {
      const res = await fetch("/api/resellers");
      const data = await res.json();
      setResellers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      resellers.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.whatsappNumber.includes(query) ||
          r.uniqueId.toLowerCase().includes(query.toLowerCase())
      ),
    [resellers, query]
  );

  const generateUniqueId = () => {
    const prefix = "RESELLER";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };
  const resetForm = () => {
    setEditingReseller(null);
    setFormData({ name: "", whatsappNumber: "", uniqueId: "" });
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
      if (res.ok) await fetchResellers();
    } catch (e) {
      console.error(e);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingReseller
        ? `/api/resellers/${editingReseller.id}`
        : "/api/resellers";
      const method = editingReseller ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to save reseller");
        return;
      }
      await fetchResellers();
      setShowModal(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Failed to save reseller");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("ID berhasil disalin!");
  };
  const copyResellerLink = (uniqueId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/products?ref=${uniqueId}`;
    navigator.clipboard.writeText(link);
    alert("Link reseller berhasil disalin!\n\n" + link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Manajemen Reseller</CardTitle>
              <CardDescription>Kelola reseller dan ID unik</CardDescription>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                resetForm();
                setFormData((f) => ({ ...f, uniqueId: generateUniqueId() }));
                setShowModal(true);
              }}
            >
              <Icons.plus className="w-4 h-4" /> Tambah Reseller
            </Button>
          </div>
          <div className="mt-3">
            <Input
              placeholder="Cari nama/WA/ID unik..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reseller) => (
          <Card key={reseller.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-muted grid place-items-center">
                    <IconUser className="w-6 h-6" />
                  </span>
                  <div>
                    <div className="font-semibold text-lg">{reseller.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reseller.whatsappNumber}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">ID Unik</div>
                    <div className="font-mono font-semibold text-purple-700">
                      {reseller.uniqueId}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => copyToClipboard(reseller.uniqueId)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="text-xs text-blue-600 font-medium mb-2">
                  Link Reseller
                </div>
                <Button
                  className="w-full"
                  onClick={() => copyResellerLink(reseller.uniqueId)}
                >
                  Copy Link Produk
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleEdit(reseller)}
                >
                  <Icons.edit className="w-4 h-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleDelete(reseller.id)}
                >
                  <Icons.trash className="w-4 h-4" /> Hapus
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                Dibuat:{" "}
                {new Date(reseller.createdAt).toLocaleDateString("id-ID")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Belum ada reseller yang cocok
          </CardContent>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingReseller ? "Edit Reseller" : "Tambah Reseller"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Reseller
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nomor WhatsApp
                </label>
                <Input
                  type="text"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  placeholder="628123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ID Unik
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    required
                    value={formData.uniqueId}
                    onChange={(e) =>
                      setFormData({ ...formData, uniqueId: e.target.value })
                    }
                    className="font-mono"
                    placeholder="RESELLER-XXX"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setFormData((f) => ({
                        ...f,
                        uniqueId: generateUniqueId(),
                      }))
                    }
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading
                    ? "Saving..."
                    : editingReseller
                    ? "Update"
                    : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
