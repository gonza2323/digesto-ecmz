import {LayoutDashboard, LogIn, LogOut} from 'lucide-react'
import {NavLink} from 'react-router-dom'
import {SchoolBrand} from '@/components/SchoolBrand'
import {useAuth} from '@/hooks/useAuth'

export function PublicHeader() {
    const {user, logout} = useAuth()

    return (
        <header
            className="
                border-b border-white/10
                bg-institutional-nav shadow-sm
            "
        >
            <div
                className="
                    mx-auto flex max-w-7xl
                    items-center justify-between
                    gap-3 px-4 py-3 sm:px-6
                "
            >

                {/* Logo y nombre de la escuela */}
                <NavLink
                    to="/"
                    className="min-w-0 rounded-lg"
                    aria-label="Ir al inicio del Digesto"
                >
                    <SchoolBrand inverted compact/>
                </NavLink>

                {/* Navegación */}
                {user ? (
                    <div className="flex shrink-0 items-center gap-2">

                        <NavLink
                            to="/admin"
                            className="
                                inline-flex items-center gap-2
                                rounded-lg bg-white
                                px-3 py-2 text-sm font-medium
                                text-institutional
                                transition-colors
                                hover:bg-institutional-50
                            "
                        >
                            <LayoutDashboard
                                className="h-4 w-4"
                                aria-hidden="true"
                            />

                            <span className="hidden sm:inline">
                                Panel administrativo
                            </span>

                            <span className="sm:hidden">
                                Panel
                            </span>
                        </NavLink>

                        <button
                            type="button"
                            onClick={() => void logout()}
                            className="
                                rounded-lg p-2 text-white/80
                                transition-colors
                                hover:bg-white/10
                                hover:text-white
                            "
                            aria-label="Cerrar sesión"
                        >
                            <LogOut
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>

                    </div>
                ) : (

                    <NavLink
                        to="/login"
                        className="
                            inline-flex shrink-0 items-center gap-2
                            rounded-lg bg-white
                            px-3 py-2 text-sm font-medium
                            text-institutional
                            transition-colors
                            hover:bg-institutional-50
                        "
                    >
                        <LogIn
                            className="h-4 w-4"
                            aria-hidden="true"
                        />

                        Ingresar
                    </NavLink>

                )}

            </div>
        </header>
    )
}