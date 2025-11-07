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
import { toast } from "sonner"; // PERBAIKAN 1: Import 'sonner'
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2, Upload } from "lucide-react"; // PERBAIKAN 2: Import ikon
import { Label } from "@/components/ui/label"; // PERBAIKAN 3: Import Label
import { cn } from "@/lib/utils"; // PERBAIKAN 4: Import cn

const Icons = {
  gear: (p: any) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
};

export default function SettingsPage() {
  const { settings, loading, refresh, setSettingsLocal } = useSettings();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
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
        // PERBAIKAN 5: Ganti format toast
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
        // PERBAIKAN 6: Ganti format toast
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
    <div className="space-y-6">
      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informasi Toko</CardTitle>
              <CardDescription>Nama dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Nama Toko"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                disabled={saving}
              />
              <Input
                placeholder="Deskripsi Toko"
                value={formData.storeDescription}
                onChange={(e) =>
                  setFormData({ ...formData, storeDescription: e.target.value })
                }
                disabled={saving}
              />
              <Input
                placeholder="Email Toko"
                type="email"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
                disabled={saving}
              />
              <Input
                placeholder="No. WhatsApp (contoh: +6281234567890)"
                value={formData.supportWhatsApp}
                onChange={(e) =>
                  setFormData({ ...formData, supportWhatsApp: e.target.value })
                }
                disabled={saving}
              />
              <Input
                placeholder="Lokasi Toko"
                value={formData.storeLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storeLocation: e.target.value })
                }
                disabled={saving}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Brand & Tema</CardTitle>
              <CardDescription>Logo, favicon, warna, dan tema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* === PERBAIKAN 7: TOMBOL UPLOAD LOGO === */}
                <div className="space-y-2">
                  <Label>Upload Logo</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadFile("logo", e.target.files?.[0])}
                    disabled={uploadingLogo || saving}
                    className="hidden" // Sembunyikan input asli
                  />
                  <Label
                    htmlFor="logo-upload"
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                      "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Variant "outline"
                      "h-10 px-4 py-2 w-full", // Size "default" + w-full
                      "cursor-pointer gap-2",
                      (uploadingLogo || saving) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingLogo ? "Mengupload..." : "Pilih File"}
                  </Label>
                </div>

                {/* === PERBAIKAN 8: TOMBOL UPLOAD FAVICON === */}
                <div className="space-y-2">
                  <Label>Upload Favicon</Label>
                  <Input
                    id="favicon-upload"
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => uploadFile("favicon", e.target.files?.[0])}
                    disabled={uploadingFavicon || saving}
                    className="hidden" // Sembunyikan input asli
                  />
                  <Label
                    htmlFor="favicon-upload"
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                      "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Variant "outline"
                      "h-10 px-4 py-2 w-full", // Size "default" + w-full
                      "cursor-pointer gap-2",
                      (uploadingFavicon || saving) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {uploadingFavicon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingFavicon ? "Mengupload..." : "Pilih File"}
                  </Label>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Primary</label>
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          handleColorChange("primaryColor", e.target.value)
                        }
                        disabled={saving}
                        className="h-10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Secondary</label>
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          handleColorChange("secondaryColor", e.target.value)
                        }
                        disabled={saving}
                        className="h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Tema default</label>
                    <Select
                      value={formData.theme}
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger disabled={saving}>
                        <SelectValue placeholder="Tema default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={saving || uploadingLogo || uploadingFavicon}
            className="ml-auto"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              "Simpan Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
