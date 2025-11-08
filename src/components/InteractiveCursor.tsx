// src/components/InteractiveCursor.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export function InteractiveCursor() {
  const [isClient, setIsClient] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Gunakan useMotionValue agar animasi lebih lancar
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    setIsClient(true); // Pastikan ini hanya berjalan di client

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Deteksi saat kursor di atas elemen yang bisa diklik
    const handleMouseOver = (e: MouseEvent) => {
      if (
        e.target instanceof Element &&
        (e.target.matches("a, button, [role='button'], [role='link']") ||
          e.target.closest("a, button, [role='button'], [role='link']"))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  // Sembunyikan di perangkat mobile
  if (
    !isClient ||
    (typeof window !== "undefined" && "ontouchstart" in window)
  ) {
    return null;
  }

  // Varian animasi untuk kursor
  const cursorVariants: Variants = {
    default: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 20 },
    },
    // Efek saat hover di atas tombol atau link
    hovering: {
      scale: 2.5,
      opacity: 0.6,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  return (
    <>
      {/* Lingkaran luar (Ring) */}
      <motion.div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border-2 border-primary",
          isHovering && "border-primary/50" // Jadi lebih transparan saat hover
        )}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        variants={cursorVariants}
        animate={isHovering ? "hovering" : "default"}
      />
      {/* Dot di tengah */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-primary"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
        animate={{
          scale: isHovering ? 0 : 1, // Sembunyikan dot saat hover
          opacity: isHovering ? 0 : 1,
        }}
      />
    </>
  );
}
