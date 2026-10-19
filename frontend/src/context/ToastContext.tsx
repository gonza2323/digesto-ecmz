import {createContext, type ReactNode, useCallback, useMemo, useRef, useState} from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
    id: number
    variant: ToastVariant
    message: string
}

interface ToastContextValue {
    toasts: Toast[]
    showToast: (variant: ToastVariant, message: string) => void
    dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({children}: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const nextId = useRef(0)

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback(
        (variant: ToastVariant, message: string) => {
            const id = nextId.current++
            setToasts((current) => [...current, {id, variant, message}])
            window.setTimeout(() => dismissToast(id), variant === 'error' ? 7000 : 4500)
        },
        [dismissToast],
    )

    const value = useMemo(() => ({toasts, showToast, dismissToast}), [toasts, showToast, dismissToast])

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
