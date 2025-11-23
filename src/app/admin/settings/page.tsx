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
import { Loader2, Upload, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, loading, refresh, setSettingsLocal } = useSettings();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // State Form
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
    isMaintenanceMode: false,
  });

  // Sinkronisasi state form saat data settings dimuat
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
        // Pastikan fallback ke false jika undefined
        isMaintenanceMode: settings.isMaintenanceMode ?? false,
      });
    }
  }, [loading, settings]);

  // Fungsi Submit / Simpan
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
        // 1. OPTIMISTIC UPDATE: Update Context Lokal Dulu (Biar UI langsung berubah)
        setSettingsLocal(formData);

        // 2. FETCH ULANG: Ambil data fresh dari server untuk memastikan sinkronisasi
        await refresh();

        toast.success("Pengaturan Disimpan", {
          description: formData.isMaintenanceMode
            ? "Status Toko: MAINTENANCE"
            : "Status Toko: LIVE",
        });
      } else {
        toast.error("Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  }

  // Fungsi Upload Gambar
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
          const newUrl = data.logoPath;
          setFormData((prev) => ({ ...prev, logoUrl: newUrl }));
          setSettingsLocal({ logoUrl: newUrl }); // Update local context juga
          toast.success("Logo berhasil diupload");
        }
        if (data.faviconPath && kind === "favicon") {
          const newUrl = data.faviconPath;
          setFormData((prev) => ({ ...prev, faviconUrl: newUrl }));
          setSettingsLocal({ faviconUrl: newUrl }); // Update local context juga
          toast.success("Favicon berhasil diupload");
        }
      } else {
        toast.error("Upload gagal", { description: data.error || "Gagal" });
      }
    } catch (error) {
      toast.error("Gagal mengupload file");
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
    // Update realtime context biar kelihatan previewnya (opsional, kalau mau live preview)
    // setSettingsLocal({ [colorType]: value });
  };

  const handleThemeChange = (value: string) => {
    const theme = value as "light" | "dark";
    setFormData((prev) => ({ ...prev, theme }));
    // setSettingsLocal({ theme }); // Uncomment jika ingin live preview ganti tema
  };

  return (
    <div className="space-y-6 pb-20">
      <form onSubmit={submit} className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- CARD 1: INFORMASI TOKO --- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Toko</CardTitle>
              <CardDescription>Detail dasar tentang toko Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Toko</Label>
                <Input
                  placeholder="Contoh: Devlog Store"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Singkat</Label>
                <Input
                  placeholder="Toko online terbaik..."
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Support</Label>
                  <Input
                    type="email"
                    placeholder="support@store.com"
                    value={formData.supportEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, supportEmail: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    placeholder="628123..."
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
              </div>
              <div className="space-y-2">
                <Label>Alamat / Lokasi</Label>
                <Input
                  placeholder="Jakarta, Indonesia"
                  value={formData.storeLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, storeLocation: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* --- CARD 2: MAINTENANCE MODE (PENTING) --- */}
            <Card className="border-orange-500/20 bg-orange-500/5 dark:bg-orange-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  Status & Akses
                </CardTitle>
                <CardDescription>
                  Atur ketersediaan toko untuk pengunjung publik.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-background/60 p-4 rounded-xl border shadow-sm">
                  <div className="space-y-1">
                    <Label className="text-base">Mode Toko</Label>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Pilih "Maintenance" untuk menutup akses publik sementara.
                    </p>
                  </div>

                  {/* SELECT COMPONENT */}
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
                    <SelectTrigger className="w-[160px] font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <span>Live (Aktif)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="true">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                          <span>Maintenance</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* --- CARD 3: BRANDING & TEMA --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual & Brand</CardTitle>
                <CardDescription>Logo, ikon, dan skema warna.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Upload Area */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo Toko</Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadFile("logo", e.target.files?.[0])}
                      disabled={uploadingLogo || saving}
                    />
                    <Label
                      htmlFor="logo-upload"
                      className={cn(
                        "flex items-center justify-center h-10 w-full rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                        (uploadingLogo || saving) &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploadingLogo ? "Mengupload..." : "Pilih Logo"}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <Input
                      id="favicon-upload"
                      type="file"
                      accept="image/png, image/x-icon"
                      className="hidden"
                      onChange={(e) =>
                        uploadFile("favicon", e.target.files?.[0])
                      }
                      disabled={uploadingFavicon || saving}
                    />
                    <Label
                      htmlFor="favicon-upload"
                      className={cn(
                        "flex items-center justify-center h-10 w-full rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                        (uploadingFavicon || saving) &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {uploadingFavicon ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploadingFavicon ? "Mengupload..." : "Pilih Icon"}
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Warna Utama</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          handleColorChange("primaryColor", e.target.value)
                        }
                        className="w-12 p-1 h-10 cursor-pointer"
                        disabled={saving}
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) =>
                          handleColorChange("primaryColor", e.target.value)
                        }
                        className="font-mono uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Warna Sekunder</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          handleColorChange("secondaryColor", e.target.value)
                        }
                        className="w-12 p-1 h-10 cursor-pointer"
                        disabled={saving}
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          handleColorChange("secondaryColor", e.target.value)
                        }
                        className="font-mono uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tema Default</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={handleThemeChange}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode (Terang)</SelectItem>
                      <SelectItem value="dark">Dark Mode (Gelap)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* STICKY ACTION BAR */}
        <div className="sticky bottom-6 z-50 flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={saving || uploadingLogo || uploadingFavicon}
            className="shadow-xl shadow-primary/20 min-w-[180px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
