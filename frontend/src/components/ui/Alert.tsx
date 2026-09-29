import {AlertCircle, AlertTriangle, CheckCircle2, Info} from 'lucide-react'
import type {ReactNode} from 'react'
import clsx from 'clsx'

type Variant = 'error' | 'warning' | 'success' | 'info'

const styles: Record<Variant, string> = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-institutional-50 border-institutional-100 text-neutral-800',
}

const icons: Record<Variant, typeof Info> = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle2,
    info: Info,
}

export function Alert({
                          variant = 'info',
                          children,
                          className,
                      }: {
    variant?: Variant
    children: ReactNode
    className?: string
}) {
    const Icon = icons[variant]
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={clsx('flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm', styles[variant], className)}
        >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true"/>
            <div className="flex-1">{children}</div>
        </div>
    )
}
