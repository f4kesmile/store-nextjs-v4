import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AdminDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean; // Prop ini tidak lagi digunakan, tapi kita biarkan agar tidak error
  footer?: React.ReactNode;
  className?: string;
}

const AdminDialog: React.FC<AdminDialogProps> = ({
  children,
  trigger,
  title,
  description,
  open,
  onOpenChange,
  size = "md",
  showCloseButton = true, // Tidak terpakai lagi
  footer,
  className,
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const responsiveClasses = cn(
    "w-full",
    sizeClasses[size],
    // Mobile: full screen on small devices
    "sm:max-w-full sm:h-full sm:rounded-none",
    // Desktop: centered modal
    "md:max-h-[90vh] md:rounded-lg",
    size === "full" ? "max-w-7xl" : sizeClasses[size]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          responsiveClasses,
          "backdrop-blur-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl",
          // Mobile adjustments
          "max-sm:m-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:border-0",
          // Desktop adjustments
          "sm:m-4",
          className
        )}
      >
        <DialogHeader className="space-y-3 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[hsl(var(--foreground))] flex-1">
              {title}
            </DialogTitle>

            {/* === TOMBOL X YANG GANDA DIHAPUS DARI SINI ===
              Komponen DialogContent (dari ui/dialog.tsx) sudah menyediakannya.
            */}
          </div>
          {description && (
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">{children}</div>

        {footer && (
          <DialogFooter className="pt-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
