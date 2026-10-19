import {Download, ExternalLink, Funnel, Search} from 'lucide-react'
import {type FormEvent, useEffect, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {autoridadesApi} from '@/api/autoridades'
import {normativasApi} from '@/api/normativas'
import {tiposDocumentoApi} from '@/api/tiposDocumento'
import {NormativaResults} from '@/components/NormativaResults'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {Pagination} from '@/components/ui/Pagination'
import {Select} from '@/components/ui/Select'
import {EmptyState, ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import type {NormativaFilters} from '@/types/normativa'

const PAGE_SIZES = [10, 20, 50]

/** Sort values use the exact property names Spring/JPA accepts on Normativa. */
const SORT_OPTIONS = [
    {value: 'releaseDate,DESC', label: 'Fecha de publicación (más recientes)'},
    {value: 'releaseDate,ASC', label: 'Fecha de publicación (más antiguas)'},
    {value: 'number,ASC', label: 'Número (menor a mayor)'},
    {value: 'number,DESC', label: 'Número (mayor a menor)'},
    {value: 'title,ASC', label: 'Título (A–Z)'},
    {value: 'title,DESC', label: 'Título (Z–A)'},
]

const FILTER_KEYS = [
    'q',
    'tipoDocumentoId',
    'autoridadId',
    'anio',
    'number',
    'recordNumber',
    'desde',
    'hasta',
] as const

function toOptionalNumber(value: string | null): number | undefined {
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

export function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [filtersOpen, setFiltersOpen] = useState(false)

    // The URL is the single source of truth for filters, page, size and sort.
    const filters: NormativaFilters = useMemo(
        () => ({
            q: searchParams.get('q') ?? undefined,
            tipoDocumentoId: searchParams.get('tipoDocumentoId') ?? undefined,
            autoridadId: searchParams.get('autoridadId') ?? undefined,
            anio: toOptionalNumber(searchParams.get('anio')),
            number: toOptionalNumber(searchParams.get('number')),
            recordNumber: toOptionalNumber(searchParams.get('recordNumber')),
            desde: searchParams.get('desde') ?? undefined,
            hasta: searchParams.get('hasta') ?? undefined,
        }),
        [searchParams],
    )
    const page = Math.max(0, (toOptionalNumber(searchParams.get('page')) ?? 1) - 1)
    const size = toOptionalNumber(searchParams.get('size')) ?? PAGE_SIZES[0]
    const sortValue = searchParams.get('sort') ?? SORT_OPTIONS[0].value
    const [sortProperty, sortDirection] = sortValue.split(',')

    // Local draft of the form so typing doesn't fire a request on every keystroke.
    const [draft, setDraft] = useState<Record<string, string>>({})
    useEffect(() => {
        const next: Record<string, string> = {}
        for (const key of FILTER_KEYS) next[key] = searchParams.get(key) ?? ''
        setDraft(next)
    }, [searchParams])

    const activeFilterCount = FILTER_KEYS.filter((key) => key !== 'q' && searchParams.get(key)).length

    const catalogs = useAsyncData(
        () => Promise.all([tiposDocumentoApi.list(), autoridadesApi.list()]),
        [],
    )
    const [tipos, autoridades] = catalogs.data ?? [[], []]

    const results = useAsyncData(
        () =>
            normativasApi.search({
                filters,
                page,
                size,
                sort: {property: sortProperty, direction: sortDirection === 'ASC' ? 'ASC' : 'DESC'},
            }),
        [searchParams.toString()],
    )

    function updateParams(changes: Record<string, string | undefined>, resetPage = true) {
        const next = new URLSearchParams(searchParams)
        for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value)
            else next.delete(key)
        }
        if (resetPage) next.delete('page')
        setSearchParams(next)
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const changes: Record<string, string | undefined> = {}
        for (const key of FILTER_KEYS) changes[key] = draft[key]?.trim() || undefined
        updateParams(changes)
    }

    function clearFilters() {
        const next = new URLSearchParams()
        const keepSort = searchParams.get('sort')
        if (keepSort) next.set('sort', keepSort)
        setSearchParams(next)
    }

    function setDraftField(key: string, value: string) {
        setDraft((current) => ({...current, [key]: value}))
    }

    const pageData = results.data

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <form onSubmit={handleSubmit} className="mb-6 sm:mb-8" role="search">
                <div className="relative mb-3 sm:mb-4">
                    <Search
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        aria-label="Buscar normativas"
                        placeholder="Buscar por título, descripción o contenido…"
                        value={draft.q ?? ''}
                        onChange={(event) => setDraftField('q', event.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-institutional focus:border-transparent"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setFiltersOpen((open) => !open)}
                        aria-expanded={filtersOpen}
                        aria-controls="filters-panel"
                    >
                        <Funnel className="w-4 h-4" aria-hidden="true"/>
                        Filtros{activeFilterCount > 0 && ` (${activeFilterCount})`}
                    </Button>
                    <Button type="submit" size="sm">
                        Buscar
                    </Button>
                    {(activeFilterCount > 0 || filters.q) && (
                        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                            Limpiar
                        </Button>
                    )}
                </div>

                {filtersOpen && (
                    <div
                        id="filters-panel"
                        className="mt-4 bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <FormField label="Tipo de normativa" htmlFor="f-tipo">
                            <Select
                                id="f-tipo"
                                value={draft.tipoDocumentoId ?? ''}
                                onChange={(event) => setDraftField('tipoDocumentoId', event.target.value)}
                            >
                                <option value="">Todos</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Autoridad" htmlFor="f-autoridad">
                            <Select
                                id="f-autoridad"
                                value={draft.autoridadId ?? ''}
                                onChange={(event) => setDraftField('autoridadId', event.target.value)}
                            >
                                <option value="">Todas</option>
                                {autoridades.map((autoridad) => (
                                    <option key={autoridad.id} value={autoridad.id}>
                                        {autoridad.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Año" htmlFor="f-anio">
                            <Input
                                id="f-anio"
                                type="number"
                                min={1900}
                                max={2100}
                                placeholder="Ej: 2026"
                                value={draft.anio ?? ''}
                                onChange={(event) => setDraftField('anio', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Número de normativa" htmlFor="f-number">
                            <Input
                                id="f-number"
                                type="number"
                                min={1}
                                placeholder="Ej: 145"
                                value={draft.number ?? ''}
                                onChange={(event) => setDraftField('number', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Número de expediente" htmlFor="f-record">
                            <Input
                                id="f-record"
                                type="number"
                                min={1}
                                value={draft.recordNumber ?? ''}
                                onChange={(event) => setDraftField('recordNumber', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Publicada desde" htmlFor="f-desde">
                            <Input
                                id="f-desde"
                                type="date"
                                value={draft.desde ?? ''}
                                onChange={(event) => setDraftField('desde', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Publicada hasta" htmlFor="f-hasta">
                            <Input
                                id="f-hasta"
                                type="date"
                                value={draft.hasta ?? ''}
                                onChange={(event) => setDraftField('hasta', event.target.value)}
                            />
                        </FormField>
                    </div>
                )}
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4">
                <p className="text-sm text-neutral-600" aria-live="polite">
                    {results.loading && !pageData
                        ? 'Buscando…'
                        : pageData
                            ? `${pageData.totalElements} ${pageData.totalElements === 1 ? 'normativa encontrada' : 'normativas encontradas'}`
                            : ''}
                </p>
                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="sort" className="text-neutral-600">
                        Ordenar por
                    </label>
                    <Select
                        id="sort"
                        className="!w-auto !py-1.5"
                        value={sortValue}
                        onChange={(event) => updateParams({sort: event.target.value})}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                    <label htmlFor="size" className="text-neutral-600 sr-only">
                        Resultados por página
                    </label>
                    <Select
                        id="size"
                        className="!w-auto !py-1.5"
                        value={size}
                        onChange={(event) => updateParams({size: event.target.value})}
                        aria-label="Resultados por página"
                    >
                        {PAGE_SIZES.map((option) => (
                            <option key={option} value={option}>
                                {option} por página
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {results.loading && !pageData ? (
                <LoadingState label="Buscando normativas…"/>
            ) : results.error ? (
                <ErrorState message={results.error} onRetry={results.reload}/>
            ) : pageData && pageData.content.length === 0 ? (
                <EmptyState
                    title="No se encontraron normativas"
                    description="Pruebe con otras palabras o quite algunos filtros."
                />
            ) : pageData ? (
                <div className={results.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                    <NormativaResults
                        items={pageData.content}
                        detailPath={(id) => `/normativas/${id}`}
                        renderActions={(item) => (
                            <>
                                <a
                                    href={normativasApi.archivoUrl(item.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-institutional rounded-lg hover:bg-institutional-dark transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" aria-hidden="true"/>
                                    Ver PDF
                                </a>
                                <a
                                    href={normativasApi.archivoUrl(item.id, true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                                    aria-label={`Descargar PDF de ${item.title}`}
                                >
                                    <Download className="w-4 h-4" aria-hidden="true"/>
                                    <span className="sm:hidden lg:inline">Descargar</span>
                                </a>
                            </>
                        )}
                    />
                    <Pagination
                        page={pageData}
                        onPageChange={(pageIndex) => updateParams({page: String(pageIndex + 1)}, false)}
                    />
                </div>
            ) : null}
        </div>
    )
}
