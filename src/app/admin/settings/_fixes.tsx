// Admin Settings page fixes
"use client";
import { useState } from "react";
import { toast } from "sonner"; // Ganti import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminThemeSelect() {
  const [value, setValue] = useState<"light" | "dark">("light");
  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(v) => setValue(v as "light" | "dark")}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Pilih tema" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>
      <button
        className="px-3 py-2 rounded-md border"
        onClick={() =>
          toast.success("Tema disimpan", { description: `Mode: ${value}` })
        }
      >
        Simpan
      </button>
    </div>
  );
}
