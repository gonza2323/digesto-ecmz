import {ChevronLeft, ChevronRight} from 'lucide-react'
import type {Page} from '@/types/common'

interface PaginationProps<T> {
    page: Page<T>
    onPageChange: (pageIndex: number) => void
}

/** `page.number` is 0-based (Spring Data convention); displayed as 1-based. */
export function Pagination<T>({page, onPageChange}: PaginationProps<T>) {
    if (page.totalPages <= 1) return null

    const current = page.number
    const pageNumbers = visiblePageNumbers(current, page.totalPages)

    return (
        <nav
            className="flex items-center justify-between gap-3 pt-4 flex-wrap"
            aria-label="Paginación de resultados"
        >
            <p className="text-xs sm:text-sm text-neutral-500">
                Página {current + 1} de {page.totalPages} · {page.totalElements}{' '}
                {page.totalElements === 1 ? 'resultado' : 'resultados'}
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(current - 1)}
                    disabled={page.first}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true"/>
                    <span className="hidden sm:inline">Anterior</span>
                </button>
                {pageNumbers.map((pageNumber, index) =>
                        pageNumber === null ? (
                            <span key={`ellipsis-${index}`} className="px-1 text-neutral-400">
              …
            </span>
                        ) : (
                            <button
                                key={pageNumber}
                                type="button"
                                onClick={() => onPageChange(pageNumber)}
                                aria-current={pageNumber === current ? 'page' : undefined}
                                className={
                                    pageNumber === current
                                        ? 'px-3 py-1.5 text-sm rounded-lg bg-institutional text-white'
                                        : 'px-3 py-1.5 text-sm rounded-lg text-neutral-700 hover:bg-neutral-50'
                                }
                            >
                                {pageNumber + 1}
                            </button>
                        ),
                )}
                <button
                    type="button"
                    onClick={() => onPageChange(current + 1)}
                    disabled={page.last}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página siguiente"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true"/>
                </button>
            </div>
        </nav>
    )
}

function visiblePageNumbers(current: number, total: number): (number | null)[] {
    const windowSize = 1
    const pages = new Set<number>([0, total - 1, current])
    for (let offset = 1; offset <= windowSize; offset++) {
        if (current - offset >= 0) pages.add(current - offset)
        if (current + offset <= total - 1) pages.add(current + offset)
    }
    const sorted = [...pages].sort((a, b) => a - b)
    const result: (number | null)[] = []
    sorted.forEach((pageNumber, index) => {
        if (index > 0 && pageNumber - sorted[index - 1] > 1) result.push(null)
        result.push(pageNumber)
    })
    return result
}
