"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Icons = { gear: (p:any)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>)}

export default function SettingsPage(){
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    supportEmail: "",
    supportWhatsApp: "",
    locale: "id",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    theme: "light" as "light" | "dark",
  });

  async function submit(e: React.FormEvent){
    e.preventDefault(); setSaving(true);
    try{ await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); }
    finally{ setSaving(false); }
  }

  async function uploadLogo(file?: File){
    if(!file) return;
    setUploading(true);
    try{
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = await res.json();
      if(data.logoPath){ setFormData(prev=>({ ...prev, logoUrl: data.logoPath })); }
    } finally{ setUploading(false); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-muted grid place-items-center"><Icons.gear className="w-4 h-4"/></span>
            <div>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Konfigurasi dasar toko + Brand & Tema</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Informasi Toko</CardTitle><CardDescription>Nama dan kontak</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nama Toko" value={formData.storeName} onChange={(e)=>setFormData({...formData, storeName: e.target.value})}/>
            <Input placeholder="Email Toko" value={formData.supportEmail} onChange={(e)=>setFormData({...formData, supportEmail: e.target.value})}/>
            <Input placeholder="No. WhatsApp" value={formData.supportWhatsApp} onChange={(e)=>setFormData({...formData, supportWhatsApp: e.target.value})}/>
            <Button disabled={saving}>{saving?"Menyimpan...":"Simpan"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Preferensi</CardTitle><CardDescription>Bahasa/Locale</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Select value={formData.locale} onValueChange={(v)=>setFormData({...formData, locale:v})}>
              <SelectTrigger><SelectValue placeholder="Bahasa"/></SelectTrigger>
              <SelectContent><SelectItem value="id">Indonesia</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" disabled={saving}>{saving?"Menyimpan...":"Simpan Preferensi"}</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Brand & Tema</CardTitle><CardDescription>Logo, favicon, warna, dan tema</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Upload Logo</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={(e)=>uploadLogo(e.target.files?.[0])} />
                  <Button type="button" variant="outline" disabled>{uploading?"Mengunggah...":"Pilih File"}</Button>
                </div>
                {formData.logoUrl && (
                  <div className="h-12 w-12 rounded bg-muted overflow-hidden grid place-items-center">
                    <img src={formData.logoUrl} alt="logo" className="max-h-12" />
                  </div>
                )}
              </div>
              <Input placeholder="Favicon URL" value={formData.faviconUrl} onChange={(e)=>setFormData({...formData, faviconUrl: e.target.value})}/>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Primary</label>
                  <Input type="color" value={formData.primaryColor} onChange={(e)=>setFormData({...formData, primaryColor: e.target.value})}/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Secondary</label>
                  <Input type="color" value={formData.secondaryColor} onChange={(e)=>setFormData({...formData, secondaryColor: e.target.value})}/>
                </div>
              </div>
              <Select value={formData.theme} onValueChange={(v)=>setFormData({...formData, theme: v as "light" | "dark"})}>
                <SelectTrigger><SelectValue placeholder="Tema default"/></SelectTrigger>
                <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Preview</div>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded bg-muted overflow-hidden grid place-items-center">
                    {formData.logoUrl ? (<img src={formData.logoUrl} alt="logo" className="max-h-10"/>) : (<div className="text-xs text-muted-foreground">Logo</div>)}
                  </div>
                  <div className="flex gap-2">
                    <span className="size-6 rounded" style={{ background: formData.primaryColor }} />
                    <span className="size-6 rounded" style={{ background: formData.secondaryColor }} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Tema: {formData.theme}</div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">{saving?"Menyimpan...":"Simpan Brand & Tema"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
