import type {ReactNode} from 'react'

interface FormFieldProps {
    label: string
    htmlFor: string
    required?: boolean
    error?: string
    hint?: string
    children: ReactNode
}

export function FormField({label, htmlFor, required, error, hint, children}: FormFieldProps) {
    const errorId = `${htmlFor}-error`
    const hintId = `${htmlFor}-hint`
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                {label} {required && <span aria-hidden="true">*</span>}
                {required && <span className="sr-only">(obligatorio)</span>}
            </label>
            {children}
            {hint && !error && (
                <p id={hintId} className="mt-1 text-xs text-neutral-500">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}
