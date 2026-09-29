import axios, {type AxiosInstance, type AxiosResponse, isAxiosError} from 'axios'
import type {ApiErrorShape, ValidationErrorBody} from '@/types/common'

/**
 * The backend authenticates with an HTTP session cookie (see AuthController /
 * SecurityConfig), not a bearer token. `withCredentials` is what makes the
 * browser send/receive that cookie on cross-origin requests to VITE_API_URL.
 */
export const API_URL = import.meta.env.VITE_API_URL

export const http: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

/** Normalized error thrown for every failed request so the UI never has to
 * branch on axios/raw-fetch internals. */
export class ApiError extends Error implements ApiErrorShape {
    status: number
    fieldErrors?: Record<string, string>

    constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.fieldErrors = fieldErrors
    }
}

function defaultMessageFor(status: number): string {
    switch (status) {
        case 400:
            return 'La solicitud contiene datos inválidos.'
        case 401:
            return 'Debe iniciar sesión para continuar.'
        case 403:
            return 'No tiene permisos para realizar esta acción.'
        case 404:
            return 'El recurso solicitado no existe.'
        case 409:
            return 'La operación no pudo completarse por un conflicto con el estado actual.'
        case 0:
            return 'No se pudo conectar con el servidor. Verifique su conexión.'
        default:
            return 'Ocurrió un error inesperado. Intente nuevamente.'
    }
}

http.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? 0
            let body = error.response?.data as ValidationErrorBody | Blob | undefined

            // Requests made with responseType: 'blob' (e.g. backup download) still get a
            // JSON error body on failure, but axios hands it back as a Blob instead of
            // parsing it. Read it back out so the real backend message surfaces.
            if (body instanceof Blob) {
                try {
                    body = JSON.parse(await body.text()) as ValidationErrorBody
                } catch {
                    body = undefined
                }
            }

            const message =
                (typeof body?.message === 'string' && body.message) || defaultMessageFor(status)

            throw new ApiError(status, message, body?.errors)
        }
        throw new ApiError(0, defaultMessageFor(0))
    },
)

/** Builds a URLSearchParams from a plain object, skipping null/undefined/empty values. */
export function toQueryParams(params: Record<string, unknown>): URLSearchParams {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') continue
        search.append(key, String(value))
    }
    return search
}

/** Extracts a filename from a Content-Disposition header, if present. */
export function filenameFromContentDisposition(
    header: string | undefined,
    fallback: string,
): string {
    if (!header) return fallback
    const match = /filename="?([^";]+)"?/i.exec(header)
    return match?.[1] ?? fallback
}

/** Triggers a browser download for an in-memory blob. */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
