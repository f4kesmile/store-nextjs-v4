"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export const MaintenanceVisual = ({
  isError = false,
}: {
  isError?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Warna dinamis
  const primaryColor = isError ? "#ef4444" : "#f59e0b"; // Red / Amber
  const secondaryColor = isError ? "#991b1b" : "#b45309";
  const glowColor = isError
    ? "rgba(239, 68, 68, 0.5)"
    : "rgba(245, 158, 11, 0.5)";

  return (
    // PERUBAHAN: Ukuran responsif (w-40 di mobile, w-64 di desktop)
    <div className="relative w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
      {/* Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Responsif */}
      <svg
        className="w-full h-full"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Elemen Berputar (Ring Luar) */}
        <motion.path
          d="M100 10 A90 90 0 0 1 190 100"
          stroke={isDark ? "#3f3f46" : "#e4e4e7"}
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />
        <motion.path
          d="M100 190 A90 90 0 0 1 10 100"
          stroke={isDark ? "#3f3f46" : "#e4e4e7"}
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />

        {/* Floating Elements */}
        <motion.g
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Base Platform */}
          <rect
            x="60"
            y="120"
            width="80"
            height="10"
            rx="2"
            fill={isDark ? "#27272a" : "#d4d4d8"}
          />

          {/* Main Shape */}
          <rect
            x="70"
            y="70"
            width="60"
            height="60"
            rx="8"
            fill={isDark ? "#18181b" : "#ffffff"}
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Status Lights */}
          <motion.circle
            cx="115"
            cy="85"
            r="4"
            fill={primaryColor}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <circle
            cx="100"
            cy="85"
            r="4"
            fill={isDark ? "#3f3f46" : "#e4e4e7"}
          />
          <circle cx="85" cy="85" r="4" fill={isDark ? "#3f3f46" : "#e4e4e7"} />

          {/* Lines */}
          <rect
            x="80"
            y="100"
            width="40"
            height="4"
            rx="2"
            fill={isDark ? "#3f3f46" : "#e4e4e7"}
          />
          <rect
            x="80"
            y="110"
            width="25"
            height="4"
            rx="2"
            fill={isDark ? "#3f3f46" : "#e4e4e7"}
          />
        </motion.g>

        {/* Floating Icon */}
        <motion.g
          animate={{
            y: [0, -10, 0],
            rotate: isError ? [0, 10, -10, 0] : [0, 360],
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            rotate: isError
              ? { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
              : { duration: 20, repeat: Infinity, ease: "linear" },
          }}
          style={{ originX: "140px", originY: "50px" }}
        >
          {isError ? (
            // Tanda Seru Warning
            <path
              d="M130 30 L150 80 H130 Z"
              fill={secondaryColor}
              stroke={primaryColor}
              strokeWidth="2"
            />
          ) : (
            // Gear
            <circle
              cx="140"
              cy="50"
              r="20"
              stroke={primaryColor}
              strokeWidth="4"
              strokeDasharray="4 4"
            />
          )}
        </motion.g>
      </svg>
    </div>
  );
};
