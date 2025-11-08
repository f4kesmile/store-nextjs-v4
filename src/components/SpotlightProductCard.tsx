// src/components/SpotlightProductCard.tsx
"use client";

import React from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
// Impor dari file yang Anda tambahkan
import { SpotlightCard } from "@/components/spotlight-card";
import { cn } from "@/lib/utils";

// Interface untuk data produk
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    iconUrl: string | null;
    stock: number;
    status?: "ACTIVE" | "INACTIVE";
    variants?: { stock: number; status: "ACTIVE" | "INACTIVE" }[];
  };
  onClick?: () => void;
}

export function SpotlightProductCard({ product, onClick }: ProductCardProps) {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Logika status untuk ketersediaan
  const activeVariants =
    product.variants?.filter((v) => v.status === "ACTIVE") || [];
  const hasActiveVariants = activeVariants.length > 0;
  let isUnavailable = false;
  let statusText = "Stok Habis";

  if (product.status === "INACTIVE") {
    isUnavailable = true;
    statusText = "Tidak Tersedia";
  } else if (hasActiveVariants) {
    const totalVariantStock = activeVariants.reduce(
      (sum, v) => sum + v.stock,
      0
    );
    isUnavailable = totalVariantStock <= 0;
  } else {
    isUnavailable = product.stock <= 0;
  }
  // ---

  return (
    <SpotlightCard
      // Class untuk ditarget oleh SplashCursor
      className={cn(
        "group bg-card border rounded-xl overflow-hidden flex flex-col h-full product-card-spotlight",
        isUnavailable
          ? "opacity-60 grayscale cursor-not-allowed"
          : "cursor-pointer"
      )}
      onClick={isUnavailable ? undefined : onClick}
      size={150}
      borderWidth={1}
      lightColor="hsl(var(--primary))" // Warna spotlight
    >
      {/* Konten Kartu */}
      <div className="relative aspect-square bg-muted overflow-hidden border-b">
        <ImageWithFallback
          src={product.iconUrl}
          alt={product.name}
          fill={true}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {statusText}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className={cn(
            "font-semibold text-base line-clamp-2 mb-1 transition-colors",
            !isUnavailable && "group-hover:text-primary"
          )}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description.replace(/[#*`_]/g, "")}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatRupiah(product.price)}
          </p>
          <span className="text-xs text-muted-foreground">
            {product.variants && product.variants.length > 0
              ? `${product.variants.length} Varian`
              : product.stock > 0
              ? `Stok: ${product.stock}`
              : null}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
