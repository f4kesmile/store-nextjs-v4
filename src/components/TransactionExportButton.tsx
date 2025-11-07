"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner"; // Ganti import

export default function TransactionExportButton() {
  const handleExport = async () => {
    try {
      const res = await fetch("/api/transactions/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transaksi_export_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Export Berhasil", {
          description: "File transaksi sedang diunduh.",
        });
      } else {
        toast.error("Export Gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="w-4 h-4" />
      Export Transaksi
    </Button>
  );
}
