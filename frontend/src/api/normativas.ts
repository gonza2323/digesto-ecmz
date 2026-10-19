import {API_URL, http, toQueryParams} from '@/api/http'
import type {Page, SortOption} from '@/types/common'
import type {
    AprobacionResult,
    NormativaDetail,
    NormativaFilters,
    NormativaFormValues,
    NormativaSummary,
} from '@/types/normativa'

export interface SearchOptions {
    filters?: NormativaFilters
    page?: number
    size?: number
    sort?: SortOption
}

function searchParams(options: SearchOptions, extra?: Record<string, unknown>): URLSearchParams {
    const {filters = {}, page, size, sort} = options
    return toQueryParams({
        ...filters,
        ...extra,
        page,
        size,
        sort: sort ? `${sort.property},${sort.direction.toLowerCase()}` : undefined,
    })
}

/** Builds the JSON+file multipart body expected by @RequestPart NormativaFormDto / MultipartFile. */
function buildNormativaFormData(values: NormativaFormValues, archivo?: File | null): FormData {
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(values)], {type: 'application/json'})
    formData.append('normativa', jsonBlob)
    if (archivo) {
        formData.append('archivo', archivo)
    }
    return formData
}

export const normativasApi = {
    // ---------- Sitio público (sólo normativas aprobadas y visibles) ----------

    async search(options: SearchOptions = {}): Promise<Page<NormativaSummary>> {
        const {data} = await http.get<Page<NormativaSummary>>('/api/normativas', {
            params: searchParams(options),
        })
        return data
    },

    async find(id: string): Promise<NormativaDetail> {
        const {data} = await http.get<NormativaDetail>(`/api/normativas/${id}`)
        return data
    },

    /** URL to view (inline) or download the PDF of a published normativa. Safe to use
     * directly as an <a href> / window.open target — the browser sends the session
     * cookie on top-level navigation. */
    archivoUrl(id: string, download = false): string {
        return `${API_URL}/api/normativas/${id}/archivo?download=${download}`
    },

    // ---------- Panel de administración ----------

    async searchAdmin(
        options: SearchOptions = {},
        pendientes = false,
    ): Promise<Page<NormativaSummary>> {
        const {data} = await http.get<Page<NormativaSummary>>('/api/admin/normativas', {
            params: searchParams(options, {pendientes}),
        })
        return data
    },

    async findAdmin(id: string): Promise<NormativaDetail> {
        const {data} = await http.get<NormativaDetail>(`/api/admin/normativas/${id}`)
        return data
    },

    archivoUrlAdmin(id: string, download = false): string {
        return `${API_URL}/api/admin/normativas/${id}/archivo?download=${download}`
    },

    /** Informational only: the backend allows reusing an expediente number. */
    async expedienteEnUso(numero: number): Promise<boolean> {
        const {data} = await http.get<{ enUso: boolean }>(
            '/api/admin/normativas/expediente-en-uso',
            {params: {numero}},
        )
        return data.enUso
    },

    async create(values: NormativaFormValues, archivo: File): Promise<NormativaDetail> {
        const {data} = await http.post<NormativaDetail>(
            '/api/admin/normativas',
            buildNormativaFormData(values, archivo),
        )
        return data
    },

    /** `archivo` is optional here: omit it to keep the currently stored PDF. */
    async update(
        id: string,
        values: NormativaFormValues,
        archivo?: File | null,
    ): Promise<NormativaDetail> {
        const {data} = await http.put<NormativaDetail>(
            `/api/admin/normativas/${id}`,
            buildNormativaFormData(values, archivo),
        )
        return data
    },

    async remove(id: string): Promise<void> {
        await http.delete(`/api/admin/normativas/${id}`)
    },

    async approve(id: string): Promise<AprobacionResult> {
        const {data} = await http.post<AprobacionResult>(`/api/admin/normativas/${id}/aprobar`)
        return data
    },

    async reject(id: string, motivo?: string): Promise<NormativaDetail> {
        const {data} = await http.post<NormativaDetail>(
            `/api/admin/normativas/${id}/rechazar`,
            null,
            {params: toQueryParams({motivo})},
        )
        return data
    },
}
