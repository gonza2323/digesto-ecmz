import {forwardRef, type InputHTMLAttributes, type ReactNode} from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({label, id, className, ...rest}, ref) => (
        <div className={`flex items-center gap-3 ${className ?? ''}`}>
            <input
                ref={ref}
                id={id}
                type="checkbox"
                className="w-4 h-4 text-institutional border-neutral-300 rounded focus:ring-institutional"
                {...rest}
            />
            <label htmlFor={id} className="text-xs sm:text-sm font-medium text-neutral-700 flex items-center gap-2">
                {label}
            </label>
        </div>
    ),
)

Checkbox.displayName = 'Checkbox'
