export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}

"use client";
import { useEffect } from "react";

function AdminShell({ children }: { children: React.ReactNode }){
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("admin-dark");
    body.classList.add("admin-body");
    return () => {
      root.classList.remove("admin-dark");
      body.classList.remove("admin-body");
    };
  }, []);
  return <>{children}</>;
}
