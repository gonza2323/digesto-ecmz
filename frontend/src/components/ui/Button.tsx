import {type ButtonHTMLAttributes, forwardRef} from 'react'
import {Loader2} from 'lucide-react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    loading?: boolean
    fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-institutional text-white hover:bg-institutional-dark',
    secondary:
        'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-institutional hover:bg-institutional-50',
}

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm sm:text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            disabled,
            className,
            children,
            ...rest
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    variantClasses[variant],
                    sizeClasses[size],
                    fullWidth && 'w-full',
                    className,
                )}
                {...rest}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true"/>}
                {children}
            </button>
        )
    },
)

Button.displayName = 'Button'
