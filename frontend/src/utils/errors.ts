import {ApiError} from '@/api/http'

/** Extracts a human-readable message from anything an API call can throw. */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Ocurrió un error inesperado. Intente nuevamente.'
}

/** Field-level validation errors, if the error carries any (400 responses only). */
export function getFieldErrors(error: unknown): Record<string, string> | undefined {
    if (error instanceof ApiError) return error.fieldErrors
    return undefined
}
