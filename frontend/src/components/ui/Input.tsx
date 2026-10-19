import {forwardRef, type InputHTMLAttributes} from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({hasError, className, ...rest}, ref) => (
        <input
            ref={ref}
            className={clsx(
                'w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-institutional focus:border-transparent',
                'disabled:bg-neutral-100 disabled:cursor-not-allowed',
                hasError ? 'border-red-400' : 'border-neutral-200',
                className,
            )}
            {...rest}
        />
    ),
)

Input.displayName = 'Input'
