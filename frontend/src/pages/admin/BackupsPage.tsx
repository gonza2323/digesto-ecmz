import {DatabaseBackup, Loader2, Upload} from 'lucide-react'
import {useState} from 'react'
import {backupsApi} from '@/api/backups'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {Modal} from '@/components/ui/Modal'
import {ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useAuth} from '@/hooks/useAuth'
import {useToast} from '@/hooks/useToast'
import {getErrorMessage} from '@/utils/errors'
import {formatDateTime, formatFileSize} from '@/utils/format'

export function BackupsPage() {
    const {showToast} = useToast()
    const {data: status, loading, error, reload} = useAsyncData(() => backupsApi.estado(), [])

    const [creating, setCreating] = useState(false)
    const [restoreOpen, setRestoreOpen] = useState(false)

    async function handleCreate() {
        setCreating(true)
        try {
            await backupsApi.crearYDescargar()
            showToast('success', 'El backup se generó y comenzó a descargarse.')
            reload()
        } catch (err) {
            showToast('error', getErrorMessage(err))
        } finally {
            setCreating(false)
        }
    }

    if (loading && !status) return <LoadingState label="Consultando estado de backups…"/>
    if (error) return <ErrorState message={error} onRetry={reload}/>
    if (!status) return null

    return (
        <div className="max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Backups</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">
                Un backup es un ZIP con la base de datos completa y todos los PDF almacenados.
            </p>

            {status.alerta && (
                <Alert variant="warning" className="mb-5">
                    {status.ultimoBackup
                        ? `No se realiza un backup hace más de ${status.mesesDeAlerta} meses.`
                        : `Todavía no se registró ningún backup (se recomienda uno al menos cada ${status.mesesDeAlerta} meses).`}
                </Alert>
            )}

            <section className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-6 mb-5">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">Último backup</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    {status.ultimoBackup ? formatDateTime(status.ultimoBackup) : 'Nunca se realizó un backup.'}
                </p>
                <Button onClick={handleCreate} loading={creating}>
                    <DatabaseBackup className="w-4 h-4" aria-hidden="true"/>
                    {creating ? 'Generando backup…' : 'Crear backup'}
                </Button>
                {creating && (
                    <p className="text-xs text-neutral-500 mt-2">
                        Puede tardar según la cantidad de documentos. No cierre esta página.
                    </p>
                )}
            </section>

            <section className="bg-white border border-red-200 rounded-lg p-5 sm:p-6">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">Restaurar desde un backup</h2>
                <p className="text-sm text-neutral-600 mb-4">
                    Reemplaza <strong>por completo</strong> la base de datos y los archivos actuales por los del ZIP.
                    Los datos y PDF cargados después de ese backup se perderán.
                </p>
                <Button variant="danger" onClick={() => setRestoreOpen(true)}>
                    <Upload className="w-4 h-4" aria-hidden="true"/>
                    Restaurar backup…
                </Button>
            </section>

            {restoreOpen && <RestoreFlow onClose={() => setRestoreOpen(false)}/>}
        </div>
    )
}

function RestoreFlow({onClose}: { onClose: () => void }) {
    const {logout} = useAuth()
    const {showToast} = useToast()

    const [step, setStep] = useState<'form' | 'confirm'>('form')
    const [file, setFile] = useState<File | null>(null)
    const [password, setPassword] = useState('')
    const [understood, setUnderstood] = useState(false)
    const [running, setRunning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canContinue = Boolean(file) && password.length > 0 && understood

    async function handleRestore() {
        if (!file) return
        setRunning(true)
        setError(null)
        try {
            await backupsApi.restaurar(file, password)
            showToast('success', 'Backup restaurado. Vuelva a iniciar sesión.')
            // The users table was replaced, so the current session may no longer be valid.
            try {
                await logout()
            } catch {
                // ignore: we reload to the login screen regardless
            }
            window.location.assign('/login')
        } catch (err) {
            setError(getErrorMessage(err))
            setStep('form')
            setRunning(false)
        }
    }

    return (
        <>
            <Modal
                title={step === 'form' ? 'Restaurar backup' : 'Confirmar restauración'}
                onClose={() => !running && onClose()}
                widthClassName="max-w-lg"
            >
                {step === 'form' ? (
                    <div className="space-y-4">
                        {error && <Alert variant="error">{error}</Alert>}
                        <Alert variant="warning">
                            Se validará el ZIP (dump de la base y PDF referenciados) y luego se reemplazarán todos los
                            datos actuales. No se puede deshacer.
                        </Alert>

                        <div>
                            <label htmlFor="restore-file"
                                   className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                                Archivo ZIP del backup <span aria-hidden="true">*</span>
                            </label>
                            <input
                                id="restore-file"
                                type="file"
                                accept=".zip,application/zip,application/x-zip-compressed"
                                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-neutral-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-neutral-300 file:bg-white file:text-sm hover:file:bg-neutral-50"
                            />
                            {file && (
                                <p className="mt-1 text-xs text-neutral-500">
                                    {file.name} · {formatFileSize(file.size)}
                                </p>
                            )}
                        </div>

                        <FormField label="Su contraseña de superadministrador" htmlFor="restore-password" required>
                            <Input
                                id="restore-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </FormField>

                        <div className="flex items-start gap-3">
                            <input
                                id="restore-understood"
                                type="checkbox"
                                checked={understood}
                                onChange={(event) => setUnderstood(event.target.checked)}
                                className="w-4 h-4 mt-0.5 text-institutional border-neutral-300 rounded focus:ring-institutional"
                            />
                            <label htmlFor="restore-understood" className="text-sm text-neutral-700">
                                Entiendo que se reemplazarán la base de datos y los archivos actuales y que esta acción
                                no
                                se puede deshacer.
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button variant="danger" disabled={!canContinue} onClick={() => setStep('confirm')}>
                                Continuar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-700">
                            Última confirmación: se restaurará <strong>{file?.name}</strong> y se perderá lo
                            cargado
                            después de ese backup. Al terminar deberá iniciar sesión nuevamente.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setStep('form')} disabled={running}>
                                Volver
                            </Button>
                            <Button variant="danger" onClick={handleRestore} loading={running}>
                                Restaurar ahora
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Blocks the whole UI while the restore runs. */}
            {running && (
                <div
                    className="fixed inset-0 z-[90] bg-white/80 flex flex-col items-center justify-center gap-3"
                    role="alert"
                    aria-busy="true"
                >
                    <Loader2 className="w-8 h-8 animate-spin text-institutional" aria-hidden="true"/>
                    <p className="text-sm font-medium text-neutral-800">Restaurando backup…</p>
                    <p className="text-xs text-neutral-500">No cierre ni recargue esta página.</p>
                </div>
            )}
        </>
    )
}
