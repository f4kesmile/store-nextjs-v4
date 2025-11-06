"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

export type ToastItem = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let queue: ToastItem[] = [];

export function toast(props: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2);
  const item: ToastItem = { id, ...props };
  queue = [item, ...queue].slice(0, 3);
  listeners.forEach((l) => l(queue));
  setTimeout(() => dismiss(id), 5000);
  return { id };
}

export function dismiss(id?: string) {
  queue = id ? queue.filter((t) => t.id !== id) : [];
  listeners.forEach((l) => l(queue));
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(queue);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description }) => (
        <Toast key={id}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
