/** Mirrors the JSON shape Spring Data serializes org.springframework.data.domain.Page<T> to. */
export interface Page<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number // current page index, 0-based
    size: number
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}

export interface SortOption {
    /** Property name exactly as Spring/JPA expects it (e.g. "releaseDate", "number", "title"). */
    property: string
    direction: 'ASC' | 'DESC'
}

/** Shape returned by ApiExceptionHandler for validation errors (400 from @Valid). */
export interface ValidationErrorBody {
    message: string
    errors?: Record<string, string>
}

/** Normalized shape every ApiError from the http client carries. */
export interface ApiErrorShape {
    status: number
    message: string
    fieldErrors?: Record<string, string>
}
