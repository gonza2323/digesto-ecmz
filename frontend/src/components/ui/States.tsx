import {AlertTriangle, FileQuestion, Loader2} from 'lucide-react'
import type {ReactNode} from 'react'
import {Button} from '@/components/ui/Button'

export function LoadingState({label = 'Cargando…'}: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-institutional" aria-hidden="true"/>
            <p className="text-sm">{label}</p>
        </div>
    )
}

export function EmptyState({
                               title,
                               description,
                               icon,
                           }: {
    title: string
    description?: string
    icon?: ReactNode
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
            <div className="text-neutral-300 mb-1">{icon ??
                <FileQuestion className="w-10 h-10" aria-hidden="true"/>}</div>
            <p className="text-sm font-medium text-neutral-700">{title}</p>
            {description && <p className="text-sm text-neutral-500 max-w-sm">{description}</p>}
        </div>
    )
}

export function ErrorState({message, onRetry}: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
            <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true"/>
            <p className="text-sm text-neutral-700 max-w-sm">{message}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </div>
    )
}
