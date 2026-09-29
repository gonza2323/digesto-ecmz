/** Parses a LocalDate string ("YYYY-MM-DD") as a local date, avoiding the UTC
 * off-by-one day shift `new Date("YYYY-MM-DD")` causes. */
function parseLocalDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number)
    return new Date(year, (month ?? 1) - 1, day ?? 1)
}

const longDateFormatter = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
})

export function formatDateLong(isoDate: string | null | undefined): string {
    if (!isoDate) return '—'
    return longDateFormatter.format(parseLocalDate(isoDate))
}

export function formatDateShort(isoDate: string | null | undefined): string {
    if (!isoDate) return '—'
    return shortDateFormatter.format(parseLocalDate(isoDate))
}

export function formatDateTime(instant: string | null | undefined): string {
    if (!instant) return '—'
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(instant))
}

export function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return '—'
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
}
