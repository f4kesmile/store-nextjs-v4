import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast"
import { useToast } from "./use-toast"

export function Toaster() {
  return (
    <ToastProvider>
      <ToasterInner />
      <ToastViewport />
    </ToastProvider>
  )
}

function ToasterInner(){
  const { toasts } = useToast()
  return (
    <div>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
            {action}
            <ToastClose />
          </Toast>
        )
      })}
    </div>
  )
}
