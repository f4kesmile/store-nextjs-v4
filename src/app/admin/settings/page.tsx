// src/app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, loading, refresh, setSettingsLocal } = useSettings();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Tambahkan state 'isMaintenanceMode'
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    supportEmail: "",
    supportWhatsApp: "",
    storeLocation: "",
    aboutTitle: "",
    aboutDescription: "",
    locale: "id",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    theme: "light" as "light" | "dark",
    isMaintenanceMode: false, // Default false
  });

  useEffect(() => {
    if (!loading && settings) {
      setFormData({
        storeName: settings.storeName || "",
        storeDescription: settings.storeDescription || "",
        supportEmail: settings.supportEmail || "",
        supportWhatsApp: settings.supportWhatsApp || "",
        storeLocation: settings.storeLocation || "",
        aboutTitle: settings.aboutTitle || "",
        aboutDescription: settings.aboutDescription || "",
        locale: settings.locale || "id",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        primaryColor: settings.primaryColor || "#2563EB",
        secondaryColor: settings.secondaryColor || "#10B981",
        theme: (settings.theme as "light" | "dark") || "light",
        // Mapping properti isMaintenanceMode (pastikan backend mengirim ini)
        isMaintenanceMode: (settings as any).isMaintenanceMode || false,
      });
    }
  }, [loading, settings]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await refresh();
        toast.success("Berhasil disimpan", {
          description: "Pengaturan diperbarui",
        });
      } else {
        toast.error("Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(kind: "logo" | "favicon", file?: File) {
    if (!file) return;
    if (kind === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);
    try {
      const fd = new FormData();
      fd.append(kind, file);
      const res = await fetch(`/api/upload/${kind}`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        if (data.logoPath && kind === "logo") {
          setFormData((prev) => ({ ...prev, logoUrl: data.logoPath }));
          setSettingsLocal({ logoUrl: data.logoPath });
          toast.success("Logo diupload");
        }
        if (data.faviconPath && kind === "favicon") {
          setFormData((prev) => ({ ...prev, faviconUrl: data.faviconPath }));
          setSettingsLocal({ faviconUrl: data.faviconPath });
          toast.success("Favicon diupload");
        }
      } else {
        toast.error("Upload gagal", { description: data.error || "Gagal" });
      }
    } finally {
      if (kind === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  }

  const handleColorChange = (
    colorType: "primaryColor" | "secondaryColor",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [colorType]: value }));
    setSettingsLocal({ [colorType]: value });
  };

  const handleThemeChange = (value: string) => {
    const theme = value as "light" | "dark";
    setFormData((prev) => ({ ...prev, theme }));
    setSettingsLocal({ theme });
  };

  return (
    <div className="space-y-6 pb-10">
      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KARTU INFORMASI TOKO */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informasi Toko</CardTitle>
              <CardDescription>Nama dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Nama Toko</Label>
                <Input
                  placeholder="Nama Toko"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Deskripsi Singkat</Label>
                <Input
                  placeholder="Deskripsi Toko"
                  value={formData.storeDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeDescription: e.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Email Support</Label>
                <Input
                  placeholder="Email Toko"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>WhatsApp Admin</Label>
                <Input
                  placeholder="No. WhatsApp (contoh: 628123...)"
                  value={formData.supportWhatsApp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supportWhatsApp: e.target.value,
                    })
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Alamat / Lokasi</Label>
                <Input
                  placeholder="Lokasi Toko"
                  value={formData.storeLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, storeLocation: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* KARTU BRAND & MAINTENANCE */}
          <div className="space-y-4">
            {/* --- KARTU MAINTENANCE MODE (BARU) --- */}
            <Card className="border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-orange-600 dark:text-orange-400">
                  Mode Darurat & Pemeliharaan
                </CardTitle>
                <CardDescription>
                  Kontrol akses pengunjung ke toko Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-foreground">
                      Status Toko
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Jika "Maintenance", hanya Admin yang bisa mengakses.
                    </p>
                  </div>
                  <Select
                    value={formData.isMaintenanceMode ? "true" : "false"}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        isMaintenanceMode: v === "true",
                      })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opsi LIVE */}
                      <SelectItem value="false">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="font-medium">Live (Aktif)</span>
                        </div>
                      </SelectItem>

                      {/* Opsi MAINTENANCE */}
                      <SelectItem value="true">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="font-medium text-muted-foreground">
                            Maintenance Mode
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* KARTU BRANDING */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Brand & Tema</CardTitle>
                <CardDescription>Logo, warna, dan tema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Upload Logo</Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          uploadFile("logo", e.target.files?.[0])
                        }
                        disabled={uploadingLogo || saving}
                        className="hidden"
                      />
                      <Label
                        htmlFor="logo-upload"
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                          "h-9 px-4 w-full cursor-pointer gap-2",
                          (uploadingLogo || saving) &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingLogo ? "..." : "Logo"}
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Favicon</Label>
                      <Input
                        id="favicon-upload"
                        type="file"
                        accept="image/x-icon,image/png"
                        onChange={(e) =>
                          uploadFile("favicon", e.target.files?.[0])
                        }
                        disabled={uploadingFavicon || saving}
                        className="hidden"
                      />
                      <Label
                        htmlFor="favicon-upload"
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                          "h-9 px-4 w-full cursor-pointer gap-2",
                          (uploadingFavicon || saving) &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {uploadingFavicon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingFavicon ? "..." : "Favicon"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) =>
                            handleColorChange("primaryColor", e.target.value)
                          }
                          disabled={saving}
                          className="h-9 w-9 p-1 cursor-pointer shrink-0"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) =>
                            handleColorChange("primaryColor", e.target.value)
                          }
                          className="h-9 uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) =>
                            handleColorChange("secondaryColor", e.target.value)
                          }
                          disabled={saving}
                          className="h-9 w-9 p-1 cursor-pointer shrink-0"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) =>
                            handleColorChange("secondaryColor", e.target.value)
                          }
                          className="h-9 uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Tema Default</Label>
                    <Select
                      value={formData.theme}
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger disabled={saving}>
                        <SelectValue placeholder="Tema default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 sticky bottom-4 z-10">
          <div className="flex-1" /> {/* Spacer */}
          <Button
            type="submit"
            disabled={saving || uploadingLogo || uploadingFavicon}
            size="lg"
            className="shadow-lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan Perubahan...
              </span>
            ) : (
              "Simpan Semua Pengaturan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
