import {type ReactNode, useEffect, useRef} from 'react'
import {X} from 'lucide-react'

interface ModalProps {
    title: string
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
    widthClassName?: string
}

export function Modal({title, onClose, children, footer, widthClassName = 'max-w-md'}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', onKeyDown)
        panelRef.current?.querySelector<HTMLElement>('button, input, textarea, select')?.focus()
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-neutral-900/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`relative w-full ${widthClassName} bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                    <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-neutral-900 font-display">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true"/>
                    </button>
                </div>
                <div className="px-5 py-4 overflow-y-auto">{children}</div>
                {footer && <div className="px-5 py-4 border-t border-neutral-200 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    )
}
