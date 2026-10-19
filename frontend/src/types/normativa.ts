export type EstadoNormativa = 'BORRADOR' | 'PENDIENTE' | 'PUBLICADA'

/** NormativaSummaryDto — what search/list endpoints return. */
export interface NormativaSummary {
    id: string
    number: number
    title: string
    description: string
    releaseDate: string // LocalDate as "YYYY-MM-DD"
    loadDate: string
    tipoDocumento: string
    autoridad: string
    archivoName: string
    archivoSize: number
    estado: EstadoNormativa
}

/** NormativaDetailDto — what the detail endpoints return. `notificaciones` is only
 * populated on the admin view (NormativaDetailDto.ofAdmin); public view sends null. */
export interface NormativaDetail {
    id: string
    number: number
    title: string
    description: string
    releaseDate: string
    loadDate: string
    tipoDocumentoId: string
    tipoDocumento: string
    autoridadId: string
    autoridad: string
    recordNumber: number
    recordTitle: string
    archivoName: string
    archivoSize: number
    estado: EstadoNormativa
    notificaciones: string[] | null
}

/** NormativaFormDto — the multipart JSON part sent on create/update. */
export interface NormativaFormValues {
    number: number
    title: string
    description: string
    releaseDate: string
    autoridadId: string
    tipoDocumentoId: string
    recordNumber: number
    recordTitle: string
    notificaciones: string[]
    enviarAAprobacion: boolean
}

/** NormativaFilterDto — query params accepted by both search endpoints. */
export interface NormativaFilters {
    q?: string
    tipoDocumentoId?: string
    autoridadId?: string
    anio?: number
    number?: number
    recordNumber?: number
    desde?: string
    hasta?: string
}

/** AprobacionResultDto */
export interface AprobacionResult {
    normativa: NormativaDetail
    notificacionesFallidas: string[]
}
