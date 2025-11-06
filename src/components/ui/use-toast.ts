"use client";

import * as React from "react";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";

export type ToastItem = { id: string; title?: string; description?: string };

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let queue: ToastItem[] = [];

export function toast(props: { title?: string; description?: string }) {
  const id = Math.random().toString(36).slice(2);
  const item: ToastItem = { id, title: props.title || "", description: props.description || "" };
  queue = [item, ...queue].slice(0, 3);
  for (let i = 0; i < listeners.length; i++) listeners[i](queue);
  setTimeout(function(){ dismiss(id); }, 5000);
  return { id };
}

export function dismiss(id?: string) {
  if (id) queue = queue.filter(function(t){ return t.id !== id; });
  else queue = [];
  for (let i = 0; i < listeners.length; i++) listeners[i](queue);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(queue);
  React.useEffect(function(){
    listeners.push(setToasts);
    return function(){ listeners = listeners.filter(function(l){ return l !== setToasts; }); };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function(t){
        return (
          <Toast key={t.id}>
            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
