import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background", // Menambahkan text-foreground untuk teks "No file chosen"
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",

          // === PERBAIKAN UTAMA DI SINI ===
          // Menambahkan style untuk tombol file input agar terlihat di dark mode
          "file:border-0 file:bg-transparent file:text-sm file:font-medium", // Style file asli
          "file:mr-4 file:py-1.5 file:px-4 file:rounded-lg", // Style layout tombol
          "file:bg-primary/10 file:text-primary hover:file:bg-primary/20", // Style warna tombol

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
