import {type ReactNode, useState} from 'react'
import {Modal} from '@/components/ui/Modal'
import {Button} from '@/components/ui/Button'

interface ConfirmDialogProps {
    title: string
    description: ReactNode
    confirmLabel?: string
    variant?: 'primary' | 'danger'
    onConfirm: () => Promise<void> | void
    onCancel: () => void
    children?: ReactNode
}

export function ConfirmDialog({
                                  title,
                                  description,
                                  confirmLabel = 'Confirmar',
                                  variant = 'danger',
                                  onConfirm,
                                  onCancel,
                                  children,
                              }: ConfirmDialogProps) {
    const [submitting, setSubmitting] = useState(false)

    async function handleConfirm() {
        setSubmitting(true)
        try {
            await onConfirm()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            title={title}
            onClose={onCancel}
            footer={
                <>
                    <Button variant="secondary" onClick={onCancel} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button variant={variant} onClick={handleConfirm} loading={submitting}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <div className="text-sm text-neutral-700 space-y-3">
                <p>{description}</p>
                {children}
            </div>
        </Modal>
    )
}
