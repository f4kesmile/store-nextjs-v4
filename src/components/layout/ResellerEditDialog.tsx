"use client";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ResellerEditDialog({ resellerId, open, onOpenChange }:{ resellerId:string; open:boolean; onOpenChange:(o:boolean)=>void }){
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange} title={`Edit Reseller #${resellerId}`} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Input placeholder="Nama Reseller" />
          <Input placeholder="No. WhatsApp" />
          <Input placeholder="Email" />
        </div>
        <div className="space-y-3">
          <Input placeholder="ID Unik" />
          <Textarea placeholder="Catatan" rows={5}/>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={()=> onOpenChange(false)}>Batal</Button>
        <Button>Simpan</Button>
      </div>
    </AdminDialog>
  );
}
