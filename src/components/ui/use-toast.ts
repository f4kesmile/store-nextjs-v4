"use client";

// Minimal toast system without JSX to avoid TS parser issues
import { createPortal } from "react-dom";
import * as React from "react";

export type ToastItem = { id: string; title?: string; description?: string; variant?: "default" | "destructive" };

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let queue: ToastItem[] = [];

export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  const id = Math.random().toString(36).slice(2);
  const item: ToastItem = { id, title: props.title || "", description: props.description || "", variant: props.variant || "default" };
  queue = [item, ...queue].slice(0, 3);
  for (let i = 0; i < listeners.length; i++) listeners[i](queue);
  setTimeout(function(){ dismiss(id); }, 4000);
  return { id };
}

export function dismiss(id?: string) {
  if (id) queue = queue.filter(function(t){ return t.id !== id; });
  else queue = [];
  for (let i = 0; i < listeners.length; i++) listeners[i](queue);
}

export function Toaster(){
  const [toasts, setToasts] = React.useState<ToastItem[]>(queue);
  const [mounted, setMounted] = React.useState(false);
  const [container, setContainer] = React.useState<HTMLElement|null>(null);
  React.useEffect(function(){
    listeners.push(setToasts);
    setMounted(true);
    const el = document.getElementById("toast-root");
    if (el) setContainer(el as HTMLElement);
    return function(){ listeners = listeners.filter(function(l){ return l !== setToasts; }); };
  }, []);

  if (!mounted || !container) return null;

  return createPortal(
    React.createElement(
      "div", { className: "fixed z-[100] bottom-4 right-4 flex flex-col gap-2" },
      toasts.map(function(t){
        const base = "min-w-[260px] rounded-md border shadow-lg px-4 py-3 transition opacity-100";
        const theme = t.variant === "destructive"
          ? "bg-destructive text-destructive-foreground border-destructive"
          : "bg-background text-foreground border";
        return React.createElement(
          "div",
          { key: t.id, className: base + " " + theme },
          React.createElement("div", { className: "text-sm font-semibold" }, t.title || ""),
          t.description ? React.createElement("div", { className: "text-xs opacity-90 mt-1" }, t.description) : null
        );
      })
    ),
    container
  );
}
