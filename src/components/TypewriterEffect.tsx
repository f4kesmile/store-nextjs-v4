// src/components/TypewriterEffect.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export function TypewriterEffect({
  text,
  className,
  delay = 2,
  speed = 85, // Kecepatan mengetik (ms per karakter)
  deleteSpeed = 50, // Kecepatan menghapus (ms per karakter)
  pauseDuration = 5000, // Jeda setelah selesai ngetik
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const ref = useRef(null);
  // (1) Kita gunakan useInView agar animasi hanya berjalan saat terlihat
  const isInView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    // Hanya jalankan jika sedang terlihat di layar
    if (!isInView) return;

    // (2) Tunda animasi awal (hanya jika ini adalah loop pertama)
    const startTimeout = setTimeout(
      () => {
        const handleTyping = () => {
          if (isDeleting) {
            // --- Logika Menghapus ---
            if (index > 0) {
              setDisplayText((prev) => prev.substring(0, prev.length - 1));
              setIndex((prev) => prev - 1);
            } else {
              // Selesai menghapus, jeda, lalu mulai ngetik lagi
              setIsDeleting(false);
              // Kita beri jeda singkat sebelum mulai ngetik lagi
              setTimeout(() => {}, pauseDuration / 2);
            }
          } else {
            // --- Logika Mengetik ---
            if (index < text.length) {
              setDisplayText((prev) => prev + text.charAt(index));
              setIndex((prev) => prev + 1);
            } else {
              // Selesai ngetik, jeda, lalu mulai hapus
              setTimeout(() => setIsDeleting(true), pauseDuration);
            }
          }
        };

        // (3) Tentukan kecepatan berdasarkan state (ngetik atau hapus)
        const currentSpeed = isDeleting ? deleteSpeed : speed;
        const typingTimeout = setTimeout(handleTyping, currentSpeed);

        return () => clearTimeout(typingTimeout);

        // Terapkan 'delay' hanya pada saat pertama kali komponen dimuat
      },
      index === 0 && !isDeleting ? delay * 1000 : 0
    );

    return () => clearTimeout(startTimeout);

    // (4) Dependensi effect
  }, [
    isInView,
    displayText,
    isDeleting,
    index,
    text,
    delay,
    speed,
    deleteSpeed,
    pauseDuration,
  ]);

  // Varian untuk kursor berkedip
  const caretVariants = {
    blink: {
      opacity: [0, 0, 1, 1],
      transition: {
        duration: 0.7,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <span className={cn("inline-flex items-center", className)} ref={ref}>
      {/* Teks yang diketik */}
      <span>{displayText}</span>

      {/* Teks untuk screen-reader (selalu penuh) */}
      <span className="sr-only">{text}</span>

      {/* Kursor yang berkedip */}
      <motion.span
        variants={caretVariants}
        animate="blink"
        className="w-[2px] h-[1em] bg-primary ml-1" // 'h-[1em]' membuatnya se-tinggi font
        aria-hidden
      />
    </span>
  );
}
