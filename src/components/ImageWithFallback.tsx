"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  fill = false,
  width,
  height,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
          fallbackClassName
        )}
        style={fill ? { width: "100%", height: "100%" } : { width, height }}
      >
        <ImageIcon className="h-1/4 w-1/4 opacity-50" />
      </div>
    );
  }

  // Jika menggunakan 'fill', kita tidak perlu width/height
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        onError={() => setError(true)}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    );
  }

  // Jika tidak menggunakan 'fill', kita wajib memberikan width & height
  return (
    <Image
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      width={width || 500} // Default width jika lupa diisi
      height={height || 500} // Default height jika lupa diisi
      onError={() => setError(true)}
      {...props}
    />
  );
}
