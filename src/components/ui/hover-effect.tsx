// src/components/ui/hover-effect.tsx
"use client";

import { cn } from "@/lib/utils";
import { createContext, useState, useContext, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// (1) Buat Context untuk melacak item yang sedang di-hover
type HoverContextType = {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const HoverContext = createContext<HoverContextType | null>(null);

const useHover = () => {
  const context = useContext(HoverContext);
  if (!context) {
    throw new Error("useHover must be used within a HoverProvider");
  }
  return context;
};

// (2) Provider untuk membungkus grid
export const HoverProvider = ({ children }: { children: React.ReactNode }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
      {children}
    </HoverContext.Provider>
  );
};

// (3) Komponen Grid Utama (Ini yang membuat responsif)
export const HoverEffect = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <HoverProvider>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", // <-- Ini yang mengatur responsivitas grid
          className
        )}
      >
        {children}
      </div>
    </HoverProvider>
  );
};

// (4) Komponen Item Kartu
export const HoverEffectItem = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id: string;
}) => {
  const { hoveredId, setHoveredId } = useHover();
  const ref = useRef<HTMLDivElement>(null);

  // (5) Animasi mouse follow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      onMouseEnter={() => setHoveredId(id)}
      onMouseLeave={() => setHoveredId(null)}
      className="relative"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          perspective: "1000px",
        }}
        className={cn("h-full w-full", className)}
      >
        {/* (6) Efek sorotan (highlight) yang halus */}
        {hoveredId === id && (
          <motion.div
            className="absolute inset-0 z-0 h-full w-full rounded-2xl bg-muted/50"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </div>
  );
};
