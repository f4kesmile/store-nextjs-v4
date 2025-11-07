import React from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    iconUrl: string | null;
    stock: number;
  };
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div
      onClick={onClick}
      className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Bagian Gambar dengan Aspek Rasio Tetap & Optimasi */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <ImageWithFallback
          src={product.iconUrl}
          alt={product.name}
          fill={true}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-base px-4 py-1">
              Stok Habis
            </Badge>
          </div>
        )}
      </div>

      {/* Bagian Informasi */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Harga & Stok */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatRupiah(product.price)}
          </p>
          <span className="text-xs text-muted-foreground">
            {product.stock > 0 ? `Stok: ${product.stock}` : null}
          </span>
        </div>
      </div>
    </div>
  );
}
