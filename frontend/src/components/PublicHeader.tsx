import {FileText, LayoutDashboard, LogIn, LogOut} from 'lucide-react'
import {NavLink} from 'react-router-dom'
import {useAuth} from '@/hooks/useAuth'

export function PublicHeader() {
    const {user, logout} = useAuth()

    return (
        <header className="bg-institutional border-b border-institutional-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <NavLink to="/" className="text-lg sm:text-2xl font-semibold text-white font-display">
                        Digesto Escuela
                    </NavLink>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <NavLink
                                to="/admin"
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white text-institutional rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true"/>
                                <span className="hidden sm:inline">Panel administrativo</span>
                                <span className="sm:hidden">Panel</span>
                            </NavLink>
                            <button
                                type="button"
                                onClick={() => void logout()}
                                className="flex items-center gap-1 px-2 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
                                aria-label="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" aria-hidden="true"/>
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white text-institutional rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true"/>
                            <span className="hidden sm:inline">Iniciar sesión</span>
                            <span className="sm:hidden">Login</span>
                        </NavLink>
                    )}
                </div>
                <nav className="flex gap-1 sm:gap-2" aria-label="Navegación principal">
                    <NavLink
                        to="/"
                        end
                        className={({isActive}) =>
                            `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg transition-colors ${
                                isActive ? 'bg-white text-institutional' : 'text-white hover:bg-institutional-dark'
                            }`
                        }
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true"/>
                        Documentos
                    </NavLink>
                </nav>
            </div>
        </header>
    )
}
