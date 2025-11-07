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
  showCloseButton?: boolean;
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
  footer,
  className,
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", // Ukuran medium diatur ke max-w-lg
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  const responsiveClasses = cn(
    "w-full",
    sizeClasses[size],
    // Desktop: centered modal
    "md:max-h-[90vh] md:rounded-xl",
    // Mobile: full screen on small devices
    "max-sm:m-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:border-0"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          responsiveClasses,
          // PERBAIKAN UTAMA: Menggunakan variabel CSS untuk background dan border
          "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-2xl",
          // Pastikan DialogContent selalu ada di tengah
          "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
          className
        )}
      >
        <DialogHeader className="space-y-3 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[hsl(var(--foreground))] flex-1">
              {title}
            </DialogTitle>
            {/* Tombol Close sudah otomatis ada di ui/dialog.tsx */}
          </div>
          {description && (
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>

        {footer && (
          <DialogFooter className="pt-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
