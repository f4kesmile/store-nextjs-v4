"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDialog({ open, onOpenChange, title, description, size = "md", children }:{ open:boolean; onOpenChange:(o:boolean)=>void; title:string; description?:string; size?:"sm"|"md"|"lg"|"xl"; children: React.ReactNode; }){
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"/>
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 grid gap-4 bg-card text-card-foreground border shadow-2xl p-4 md:p-6 rounded-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            size === "sm" && "w-[95vw] max-w-sm",
            size === "md" && "w-[95vw] max-w-lg",
            size === "lg" && "w-[95vw] max-w-2xl",
            size === "xl" && "w-[95vw] max-w-4xl",
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <DialogPrimitive.Close className="rounded-md p-2 hover:bg-muted" aria-label="Close">
              <X className="h-5 w-5"/>
            </DialogPrimitive.Close>
          </div>
          <div className="max-h-[75vh] overflow-auto pr-1">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
