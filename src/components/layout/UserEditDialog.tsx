"use client";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UserEditDialog({ userId, open, onOpenChange }:{ userId:string; open:boolean; onOpenChange:(o:boolean)=>void }){
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange} title={`Edit User #${userId}`} size="md">
      <div className="space-y-3">
        <Input placeholder="Username" />
        <Input placeholder="Email" />
        <Input placeholder="Password (opsional)" type="password" />
        <Select>
          <SelectTrigger><SelectValue placeholder="Pilih role"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="DEVELOPER">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={()=> onOpenChange(false)}>Batal</Button>
        <Button>Update</Button>
      </div>
    </AdminDialog>
  );
}
