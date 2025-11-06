"use client";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DemoDialogUsage(){
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4 border rounded-xl">
      <Button onClick={()=> setOpen(true)}>Buka Dialog</Button>
      <AdminDialog open={open} onOpenChange={setOpen} title="Edit Data" description="Formulir pengeditan" size="lg">
        <div className="space-y-3">
          <input className="w-full rounded-md bg-background border px-3 py-2" placeholder="Nama"/>
          <input className="w-full rounded-md bg-background border px-3 py-2" placeholder="Email"/>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={()=> setOpen(false)}>Batal</Button>
            <Button>Simpan</Button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}
