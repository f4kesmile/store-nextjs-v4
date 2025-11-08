// src/components/ui/floating-dock.tsx
"use client";

import { cn } from "@/lib/utils";
// (1) Hapus import IconLayoutNavbarCollapse (tidak dipakai lagi)
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"; // Pastikan ini dari "framer-motion"

import { useRef, useState } from "react";
import Link from "next/link"; // (2) Tambahkan import Link

export const FloatingDock = ({
  items,
  className, // Tambahkan className di sini
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
  }[];
  className?: string; // Tambahkan className di sini
}) => {
  // (3) Hapus FloatingDockMobile, kita hanya pakai satu versi
  return <FloatingDockContent items={items} className={className} />;
};

const FloatingDockContent = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
  }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      // (4) PERBAIKAN UTAMA:
      // 'flex' (bukan 'hidden') = Selalu terlihat, selalu horizontal
      // 'h-14 md:h-16' = Ukuran dasar 14 (56px) di mobile, 16 (64px) di desktop
      // 'gap-2 md:gap-4' = Jarak antar ikon
      // 'px-3 md:px-4' = Padding horizontal
      // 'pb-2 md:pb-3' = Padding bawah
      className={cn(
        "flex h-14 md:h-16 items-end gap-2 md:gap-4 rounded-2xl bg-gray-50 px-3 md:px-4 pb-2 md:pb-3 dark:bg-neutral-900 shadow-lg",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // (5) PERBAIKAN UKURAN:
  // Ukuran Mobile: Base 36px (h-9), Animasi 60px (h-15)
  // Ukuran Desktop: Base 40px (h-10), Animasi 80px (h-20)

  // Ukuran Wadah Ikon
  let widthTransform = useTransform(distance, [-150, 0, 150], [36, 60, 36]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [36, 60, 36]);
  // Ukuran Wadah Ikon (Desktop)
  let mdWidthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let mdHeightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  // Ukuran Ikon di Dalam
  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [18, 30, 18]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [18, 30, 18]
  );
  // Ukuran Ikon di Dalam (Desktop)
  let mdWidthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );
  let mdHeightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

  // (6) Terapkan ukuran responsif menggunakan useSpring
  let width = useSpring(
    // Cek apakah kita di mobile (window.innerWidth)
    typeof window !== "undefined" && window.innerWidth < 768
      ? widthTransform
      : mdWidthTransform,
    { mass: 0.1, stiffness: 150, damping: 12 }
  );
  let height = useSpring(
    typeof window !== "undefined" && window.innerWidth < 768
      ? heightTransform
      : mdHeightTransform,
    { mass: 0.1, stiffness: 150, damping: 12 }
  );
  let widthIcon = useSpring(
    typeof window !== "undefined" && window.innerWidth < 768
      ? widthTransformIcon
      : mdWidthTransformIcon,
    { mass: 0.1, stiffness: 150, damping: 12 }
  );
  let heightIcon = useSpring(
    typeof window !== "undefined" && window.innerWidth < 768
      ? heightTransformIcon
      : mdHeightTransformIcon,
    { mass: 0.1, stiffness: 150, damping: 12 }
  );

  const [hovered, setHovered] = useState(false);

  // (7) Gunakan 'button' jika ada onClick, atau 'Link' jika ada href
  const Element: any = onClick ? "button" : Link;

  return (
    <Element href={href} onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Element>
  );
}
