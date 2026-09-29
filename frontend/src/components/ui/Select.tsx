import {forwardRef, type SelectHTMLAttributes} from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({hasError, className, children, ...rest}, ref) => (
        <select
            ref={ref}
            className={clsx(
                'w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white',
                'focus:outline-none focus:ring-2 focus:ring-institutional focus:border-transparent',
                'disabled:bg-neutral-100 disabled:cursor-not-allowed',
                hasError ? 'border-red-400' : 'border-neutral-200',
                className,
            )}
            {...rest}
        >
            {children}
        </select>
    ),
)

Select.displayName = 'Select'
