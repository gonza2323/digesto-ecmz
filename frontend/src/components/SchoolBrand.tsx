interface SchoolBrandProps {
    inverted?: boolean
    compact?: boolean
}

export function SchoolBrand({
    inverted = false,
    compact = false
}: SchoolBrandProps) {
    return (
        <span className="inline-flex min-w-0 items-center gap-3">

            {/* Logo de la escuela */}
            <span
                className={`
                    flex shrink-0 items-center justify-center
                    rounded-xl bg-white p-1.5 shadow-sm
                    ${compact ? 'h-10 w-10' : 'h-12 w-12'}
                `}
            >
                <img
                    src="/logo-escuela.png"
                    alt=""
                    className="h-full w-full object-contain"
                />
            </span>

            {/* Nombre institucional */}
            <span className="flex min-w-0 flex-col">

                <span
                    className={`
                        font-display font-semibold leading-tight
                        ${compact ? 'text-base' : 'text-lg sm:text-xl'}
                        ${inverted ? 'text-white' : 'text-ink'}
                    `}
                >
                    Digesto Escuela
                </span>

                <span
                    className={`
                        hidden text-xs leading-tight sm:block
                        ${inverted ? 'text-white/80' : 'text-neutral-500'}
                    `}
                >
                    Martín Zapata · UNCuyo
                </span>

            </span>
        </span>
    )
}