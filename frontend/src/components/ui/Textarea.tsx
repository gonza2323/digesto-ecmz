import {forwardRef, type TextareaHTMLAttributes} from 'react'
import clsx from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({hasError, className, ...rest}, ref) => (
        <textarea
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

Textarea.displayName = 'Textarea'
