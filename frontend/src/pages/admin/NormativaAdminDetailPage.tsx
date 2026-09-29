import {ArrowLeft, Check, ExternalLink, Pencil, Trash2, X} from 'lucide-react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {normativasApi} from '@/api/normativas'
import {Alert} from '@/components/ui/Alert'
import {Badge, EstadoBadge} from '@/components/ui/Badge'
import {Button} from '@/components/ui/Button'
import {ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useAuth} from '@/hooks/useAuth'
import {useNormativaActions} from '@/hooks/useNormativaActions'
import {formatDateLong, formatFileSize} from '@/utils/format'

export function NormativaAdminDetailPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {hasRole} = useAuth()

    const {data, loading, error, reload} = useAsyncData(
        () => normativasApi.findAdmin(id as string),
        [id],
    )

    // After deleting, the record no longer exists, so go back to the list instead of reloading.
    const actions = useNormativaActions((kind) => {
        if (kind === 'delete') navigate('/admin/normativas', {replace: true})
        else reload()
    })

    if (loading && !data) return <LoadingState label="Cargando normativa…"/>
    if (error) return <ErrorState message={error} onRetry={reload}/>
    if (!data) return null

    const isPending = data.estado === 'PENDIENTE'

    return (
        <div className="max-w-4xl">
            <Link
                to={isPending && hasRole('SUPERADMIN') ? '/admin/normativas/pendientes' : '/admin/normativas'}
                className="inline-flex items-center gap-1.5 text-sm text-institutional hover:underline mb-4"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true"/>
                Volver al listado
            </Link>

            <article className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <EstadoBadge estado={data.estado}/>
                    <Badge className="bg-neutral-100 text-neutral-700">{data.tipoDocumento}</Badge>
                    <span className="text-sm text-neutral-500">N° {data.number}</span>
                </div>

                <h1 className="text-2xl font-semibold text-neutral-900 mb-3">{data.title}</h1>
                <p className="text-neutral-700 whitespace-pre-line mb-6">{data.description}</p>

                {data.estado === 'BORRADOR' && (
                    <Alert variant="info" className="mb-6">
                        Es un borrador: no es visible para el público ni está esperando aprobación. Edítela y envíela
                        a aprobación para publicarla.
                    </Alert>
                )}
                {isPending && (
                    <Alert variant="warning" className="mb-6">
                        Esta normativa espera aprobación de un superadministrador y no es visible para el público.
                    </Alert>
                )}

                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 border-t border-neutral-200 pt-6 text-sm">
                    <Item label="Autoridad" value={data.autoridad}/>
                    <Item label="Fecha de publicación" value={formatDateLong(data.releaseDate)}/>
                    <Item label="Expediente" value={`N° ${data.recordNumber} — ${data.recordTitle}`}/>
                    <Item label="Fecha de carga" value={formatDateLong(data.loadDate)}/>
                    <Item label="Archivo" value={`${data.archivoName} (${formatFileSize(data.archivoSize)})`}/>
                    <div className="sm:col-span-2">
                        <dt className="text-neutral-500">Correos a notificar al aprobar</dt>
                        <dd className="text-neutral-900 font-medium mt-0.5">
                            {data.notificaciones && data.notificaciones.length > 0
                                ? data.notificaciones.join(', ')
                                : 'Ninguno'}
                        </dd>
                    </div>
                </dl>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-8 pt-6 border-t border-neutral-200">
                    <a
                        href={normativasApi.archivoUrlAdmin(data.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" aria-hidden="true"/>
                        Revisar PDF
                    </a>
                    <Button variant="secondary" onClick={() => navigate(`/admin/normativas/${data.id}/editar`)}>
                        <Pencil className="w-4 h-4" aria-hidden="true"/>
                        Editar
                    </Button>
                    {hasRole('SUPERADMIN') && isPending && (
                        <>
                            <Button onClick={() => actions.askApprove(data.id, data.title)}>
                                <Check className="w-4 h-4" aria-hidden="true"/>
                                Aprobar
                            </Button>
                            <Button variant="secondary" onClick={() => actions.askReject(data.id, data.title)}>
                                <X className="w-4 h-4" aria-hidden="true"/>
                                Rechazar
                            </Button>
                        </>
                    )}
                    <Button variant="danger" onClick={() => actions.askDelete(data.id, data.title)}>
                        <Trash2 className="w-4 h-4" aria-hidden="true"/>
                        Eliminar
                    </Button>
                </div>
            </article>

            {actions.dialogs}
        </div>
    )
}

function Item({label, value}: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-neutral-500">{label}</dt>
            <dd className="text-neutral-900 font-medium mt-0.5">{value}</dd>
        </div>
    )
}
