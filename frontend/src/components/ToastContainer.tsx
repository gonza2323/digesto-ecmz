import {AlertCircle, CheckCircle2, Info, X} from 'lucide-react'
import {useToast} from '@/hooks/useToast'
import type {ToastVariant} from '@/context/ToastContext'

const variantStyles: Record<ToastVariant, string> = {
    success: 'bg-white border-green-200 text-green-800',
    error: 'bg-white border-red-200 text-red-800',
    info: 'bg-white border-institutional-100 text-neutral-800',
}

const variantIcons: Record<ToastVariant, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
}

export function ToastContainer() {
    const {toasts, dismissToast} = useToast()

    if (toasts.length === 0) return null

    return (
        <div
            className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96"
            role="region"
            aria-live="polite"
            aria-label="Notificaciones"
        >
            {toasts.map((toast) => {
                const Icon = variantIcons[toast.variant]
                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-2 border rounded-lg shadow-lg px-4 py-3 ${variantStyles[toast.variant]}`}
                    >
                        <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true"/>
                        <p className="text-sm flex-1">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Cerrar notificación"
                            className="text-neutral-400 hover:text-neutral-600"
                        >
                            <X className="w-4 h-4" aria-hidden="true"/>
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
