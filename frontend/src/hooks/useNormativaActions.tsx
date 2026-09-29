import {useState} from 'react'
import {normativasApi} from '@/api/normativas'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {ConfirmDialog} from '@/components/ui/ConfirmDialog'
import {Modal} from '@/components/ui/Modal'
import {Textarea} from '@/components/ui/Textarea'
import {useToast} from '@/hooks/useToast'
import {getErrorMessage} from '@/utils/errors'

type Pending =
    | { kind: 'delete'; id: string; title: string }
    | { kind: 'approve'; id: string; title: string }
    | { kind: 'reject'; id: string; title: string }

/**
 * Owns the confirm dialogs and API calls for delete / approve / reject so both the
 * list and detail screens behave identically. Render `dialogs` somewhere in the page.
 */
export function useNormativaActions(onDone: (kind: Pending['kind']) => void) {
    const {showToast} = useToast()
    const [pending, setPending] = useState<Pending | null>(null)
    const [motivo, setMotivo] = useState('')
    const [failedEmails, setFailedEmails] = useState<string[] | null>(null)

    function close() {
        setPending(null)
        setMotivo('')
    }

    async function confirmDelete(id: string) {
        try {
            await normativasApi.remove(id)
            showToast('success', 'La normativa fue eliminada.')
            close()
            onDone('delete')
        } catch (error) {
            showToast('error', getErrorMessage(error))
        }
    }

    async function confirmApprove(id: string) {
        try {
            const result = await normativasApi.approve(id)
            close()
            // The approval itself succeeded even if some notification emails did not go out.
            if (result.notificacionesFallidas.length > 0) {
                setFailedEmails(result.notificacionesFallidas)
            } else {
                showToast('success', 'La normativa fue aprobada y ya es pública.')
            }
            onDone('approve')
        } catch (error) {
            showToast('error', getErrorMessage(error))
        }
    }

    async function confirmReject(id: string) {
        try {
            await normativasApi.reject(id, motivo.trim() || undefined)
            showToast('success', 'La normativa fue rechazada.')
            close()
            onDone('reject')
        } catch (error) {
            showToast('error', getErrorMessage(error))
        }
    }

    const dialogs = (
        <>
            {pending?.kind === 'delete' && (
                <ConfirmDialog
                    title="Eliminar normativa"
                    description={
                        <>
                            ¿Seguro que desea eliminar <strong>{pending.title}</strong>? Dejará de aparecer en el
                            sitio y en la administración. El archivo PDF y los registros asociados se conservan.
                        </>
                    }
                    confirmLabel="Eliminar"
                    onCancel={close}
                    onConfirm={() => confirmDelete(pending.id)}
                />
            )}

            {pending?.kind === 'approve' && (
                <ConfirmDialog
                    title="Aprobar normativa"
                    variant="primary"
                    description={
                        <>
                            Al aprobar <strong>{pending.title}</strong> quedará visible para el público y se enviarán
                            las notificaciones por correo asociadas.
                        </>
                    }
                    confirmLabel="Aprobar"
                    onCancel={close}
                    onConfirm={() => confirmApprove(pending.id)}
                />
            )}

            {pending?.kind === 'reject' && (
                <ConfirmDialog
                    title="Rechazar normativa"
                    description={
                        <>
                            Se rechazará <strong>{pending.title}</strong>. Si era una modificación de una normativa ya
                            publicada, se restaurará la versión anterior; si era nueva, volverá a borrador. Se avisará
                            por correo a quien la cargó.
                        </>
                    }
                    confirmLabel="Rechazar"
                    onCancel={close}
                    onConfirm={() => confirmReject(pending.id)}
                >
                    <div>
                        <label htmlFor="motivo" className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                            Motivo (opcional)
                        </label>
                        <Textarea
                            id="motivo"
                            rows={3}
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            placeholder="Indique por qué se rechaza"
                        />
                    </div>
                </ConfirmDialog>
            )}

            {failedEmails && (
                <Modal
                    title="Normativa aprobada"
                    onClose={() => setFailedEmails(null)}
                    footer={<Button onClick={() => setFailedEmails(null)}>Entendido</Button>}
                >
                    <div className="space-y-3 text-sm text-neutral-700">
                        <Alert variant="success">La normativa fue aprobada y ya es pública.</Alert>
                        <Alert variant="warning">
                            Algunas notificaciones no pudieron enviarse a estas direcciones:
                            <ul className="list-disc pl-5 mt-1">
                                {failedEmails.map((email) => (
                                    <li key={email}>{email}</li>
                                ))}
                            </ul>
                        </Alert>
                    </div>
                </Modal>
            )}
        </>
    )

    return {
        dialogs,
        askDelete: (id: string, title: string) => setPending({kind: 'delete', id, title}),
        askApprove: (id: string, title: string) => setPending({kind: 'approve', id, title}),
        askReject: (id: string, title: string) => setPending({kind: 'reject', id, title}),
    }
}
