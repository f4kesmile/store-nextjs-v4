"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ResponsiveForm({ title = "Edit", onSubmit }: { title?: string; onSubmit: (v:any)=>Promise<void> | void }){
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent){ e.preventDefault(); setSaving(true); try{ await onSubmit({}); } finally { setSaving(false); } }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input placeholder="Nama" />
              <Input placeholder="Email / SKU" />
              <Select><SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-3">
              <Input placeholder="Harga / No. Telp" />
              <Textarea placeholder="Catatan" rows={5} />
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button type="button" variant="secondary">Batal</Button>
            <Button type="submit" disabled={saving}>{saving?"Menyimpan...":"Simpan"}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
