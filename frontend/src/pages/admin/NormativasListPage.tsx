import {Check, ExternalLink, Eye, FilePlus, Pencil, Search, Trash2, X} from 'lucide-react'
import {type FormEvent, useState} from 'react'
import {Link} from 'react-router-dom'
import {autoridadesApi} from '@/api/autoridades'
import {normativasApi} from '@/api/normativas'
import {tiposDocumentoApi} from '@/api/tiposDocumento'
import {NormativaResults} from '@/components/NormativaResults'
import {Button} from '@/components/ui/Button'
import {Input} from '@/components/ui/Input'
import {Pagination} from '@/components/ui/Pagination'
import {Select} from '@/components/ui/Select'
import {EmptyState, ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useAuth} from '@/hooks/useAuth'
import {useNormativaActions} from '@/hooks/useNormativaActions'
import type {NormativaFilters} from '@/types/normativa'

const PAGE_SIZE = 10

interface Props {
    /** When true, lists only normativas waiting for approval (superadmin queue). */
    pendientesOnly?: boolean
}

export function NormativasListPage({pendientesOnly = false}: Props) {
    const {hasRole} = useAuth()
    const isSuper = hasRole('SUPERADMIN')

    const [draftQ, setDraftQ] = useState('')
    const [draftTipo, setDraftTipo] = useState('')
    const [draftAutoridad, setDraftAutoridad] = useState('')
    const [filters, setFilters] = useState<NormativaFilters>({})
    const [page, setPage] = useState(0)

    const catalogs = useAsyncData(
        () => Promise.all([tiposDocumentoApi.list(), autoridadesApi.list()]),
        [],
    )
    const [tipos, autoridades] = catalogs.data ?? [[], []]

    const results = useAsyncData(
        () => normativasApi.searchAdmin({filters, page, size: PAGE_SIZE}, pendientesOnly),
        [JSON.stringify(filters), page, pendientesOnly],
    )

    const actions = useNormativaActions(results.reload)

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setPage(0)
        setFilters({
            q: draftQ.trim() || undefined,
            tipoDocumentoId: draftTipo || undefined,
            autoridadId: draftAutoridad || undefined,
        })
    }

    const pageData = results.data

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">
                        {pendientesOnly ? 'Pendientes de aprobación' : 'Normativas'}
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                        {pendientesOnly
                            ? 'Revise el PDF y decida si aprobar o rechazar cada carga o modificación.'
                            : 'Incluye borradores y normativas pendientes de aprobación.'}
                    </p>
                </div>
                {!pendientesOnly && (
                    <Link
                        to="/admin/normativas/nueva"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-institutional text-white rounded-lg hover:bg-institutional-dark transition-colors text-sm sm:text-base"
                    >
                        <FilePlus className="w-4 h-4" aria-hidden="true"/>
                        Nueva normativa
                    </Link>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-5" role="search">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        aria-label="Buscar normativas"
                        placeholder="Buscar…"
                        className="pl-9 sm:pl-10"
                        value={draftQ}
                        onChange={(event) => setDraftQ(event.target.value)}
                    />
                </div>
                <Select
                    aria-label="Tipo de normativa"
                    className="sm:!w-44"
                    value={draftTipo}
                    onChange={(event) => setDraftTipo(event.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    {tipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.name}
                        </option>
                    ))}
                </Select>
                <Select
                    aria-label="Autoridad"
                    className="sm:!w-48"
                    value={draftAutoridad}
                    onChange={(event) => setDraftAutoridad(event.target.value)}
                >
                    <option value="">Todas las autoridades</option>
                    {autoridades.map((autoridad) => (
                        <option key={autoridad.id} value={autoridad.id}>
                            {autoridad.name}
                        </option>
                    ))}
                </Select>
                <Button type="submit">Buscar</Button>
            </form>

            {results.loading && !pageData ? (
                <LoadingState label="Cargando normativas…"/>
            ) : results.error ? (
                <ErrorState message={results.error} onRetry={results.reload}/>
            ) : pageData && pageData.content.length === 0 ? (
                <EmptyState
                    title={pendientesOnly ? 'No hay normativas pendientes' : 'No se encontraron normativas'}
                    description={
                        pendientesOnly
                            ? 'Cuando alguien envíe una normativa a aprobación aparecerá aquí.'
                            : 'Pruebe con otros filtros o cree una nueva normativa.'
                    }
                />
            ) : pageData ? (
                <div className={results.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                    <NormativaResults
                        items={pageData.content}
                        showEstado
                        detailPath={(id) => `/admin/normativas/${id}`}
                        renderActions={(item) => (
                            <>
                                <IconLink to={`/admin/normativas/${item.id}`} label={`Ver ${item.title}`}>
                                    <Eye className="w-4 h-4" aria-hidden="true"/>
                                </IconLink>
                                <a
                                    href={normativasApi.archivoUrlAdmin(item.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Abrir PDF de ${item.title}`}
                                    className="p-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" aria-hidden="true"/>
                                </a>
                                <IconLink to={`/admin/normativas/${item.id}/editar`} label={`Editar ${item.title}`}>
                                    <Pencil className="w-4 h-4" aria-hidden="true"/>
                                </IconLink>
                                {isSuper && item.estado === 'PENDIENTE' && (
                                    <>
                                        <Button size="sm" onClick={() => actions.askApprove(item.id, item.title)}>
                                            <Check className="w-4 h-4" aria-hidden="true"/>
                                            Aprobar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => actions.askReject(item.id, item.title)}
                                        >
                                            <X className="w-4 h-4" aria-hidden="true"/>
                                            Rechazar
                                        </Button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => actions.askDelete(item.id, item.title)}
                                    aria-label={`Eliminar ${item.title}`}
                                    className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" aria-hidden="true"/>
                                </button>
                            </>
                        )}
                    />
                    <Pagination page={pageData} onPageChange={setPage}/>
                </div>
            ) : null}

            {actions.dialogs}
        </div>
    )
}

function IconLink({to, label, children}: { to: string; label: string; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            aria-label={label}
            className="p-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
        >
            {children}
        </Link>
    )
}
