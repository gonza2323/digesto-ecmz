import {ArrowLeft, Download, ExternalLink} from 'lucide-react'
import {Link, useParams} from 'react-router-dom'
import {normativasApi} from '@/api/normativas'
import {Badge} from '@/components/ui/Badge'
import {ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {formatDateLong, formatFileSize} from '@/utils/format'

export function NormativaDetailPage() {
    const {id} = useParams<{ id: string }>()
    const {data, loading, error, reload} = useAsyncData(
        () => normativasApi.find(id as string),
        [id],
    )

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-institutional hover:underline mb-4"
            >
                <ArrowLeft className="w-4 h-4" aria-hidden="true"/>
                Volver al listado
            </Link>

            {loading && !data ? (
                <LoadingState label="Cargando normativa…"/>
            ) : error ? (
                <ErrorState message={error} onRetry={reload}/>
            ) : data ? (
                <article className="bg-white border border-neutral-200 rounded-lg p-5 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className="bg-neutral-100 text-neutral-700">{data.tipoDocumento}</Badge>
                        <span className="text-sm text-neutral-500">N° {data.number}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">{data.title}</h1>
                    <p className="text-neutral-700 whitespace-pre-line mb-6">{data.description}</p>

                    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 border-t border-neutral-200 pt-6 text-sm">
                        <Item label="Autoridad" value={data.autoridad}/>
                        <Item label="Fecha de publicación" value={formatDateLong(data.releaseDate)}/>
                        <Item label="Expediente" value={`N° ${data.recordNumber} — ${data.recordTitle}`}/>
                        <Item label="Fecha de carga" value={formatDateLong(data.loadDate)}/>
                        <Item
                            label="Archivo"
                            value={`${data.archivoName} (${formatFileSize(data.archivoSize)})`}
                        />
                    </dl>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-8 pt-6 border-t border-neutral-200">
                        <a
                            href={normativasApi.archivoUrl(data.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-institutional text-white rounded-lg hover:bg-institutional-dark transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" aria-hidden="true"/>
                            Ver PDF
                        </a>
                        <a
                            href={normativasApi.archivoUrl(data.id, true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            <Download className="w-4 h-4" aria-hidden="true"/>
                            Descargar PDF
                        </a>
                    </div>
                </article>
            ) : null}
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
