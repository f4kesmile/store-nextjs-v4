import * as React from "react"
import { type ToastActionElement } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

export type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const state: Toast[] = []

const listeners: Array<(state: Toast[]) => void> = []

function dispatch(action: any) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      state.push({ ...action.toast })
      if (state.length > TOAST_LIMIT) {
        state.shift()
      }
      break
    case actionTypes.UPDATE_TOAST:
      const idx = state.findIndex((t) => t.id === action.toast.id)
      if (idx !== -1) state[idx] = { ...state[idx], ...action.toast }
      break
    case actionTypes.DISMISS_TOAST:
      const index = state.findIndex((t) => t.id === action.toastId)
      if (index !== -1) state.splice(index, 1)
      break
    case actionTypes.REMOVE_TOAST:
      const i = state.findIndex((t) => t.id === action.toastId)
      if (i !== -1) state.splice(i, 1)
      break
  }
  listeners.forEach((listener) => listener(state))
}

function addToastsListener(listener: (state: Toast[]) => void) {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) listeners.splice(index, 1)
  }
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(state)
  React.useEffect(() => addToastsListener(setToasts), [])

  const toast = React.useCallback(({ ...props }: Omit<Toast, "id">) => {
    const id = genId()
    dispatch({ type: actionTypes.ADD_TOAST, toast: { id, ...props } })
    toastTimeouts.set(
      id,
      setTimeout(() => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }), TOAST_REMOVE_DELAY)
    )
    return { id }
  }, [])

  const dismiss = React.useCallback((toastId: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }), [])
  return { toasts, toast, dismiss }
}
