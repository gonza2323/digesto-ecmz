import clsx from 'clsx'
import type {ReactNode} from 'react'
import type {EstadoNormativa} from '@/types/normativa'

export function Badge({children, className}: { children: ReactNode; className?: string }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-1 text-xs sm:text-sm rounded font-medium',
                className,
            )}
        >
      {children}
    </span>
    )
}

const estadoStyles: Record<EstadoNormativa, string> = {
    PUBLICADA: 'bg-green-100 text-green-800',
    PENDIENTE: 'bg-amber-100 text-amber-800',
    BORRADOR: 'bg-neutral-100 text-neutral-700',
}

const estadoLabels: Record<EstadoNormativa, string> = {
    PUBLICADA: 'Publicada',
    PENDIENTE: 'Pendiente',
    BORRADOR: 'Borrador',
}

export function EstadoBadge({estado}: { estado: EstadoNormativa }) {
    return <Badge className={estadoStyles[estado]}>{estadoLabels[estado]}</Badge>
}
