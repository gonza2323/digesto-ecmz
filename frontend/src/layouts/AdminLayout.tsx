import {AlertTriangle, ExternalLink, LogOut, Menu, X} from 'lucide-react'
import {useEffect, useState} from 'react'
import {NavLink, Outlet} from 'react-router-dom'
import {backupsApi} from '@/api/backups'
import {AdminSidebar} from '@/components/AdminSidebar'
import {useAuth} from '@/hooks/useAuth'

export function AdminLayout() {
    const {user, hasRole, logout} = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [backupAlert, setBackupAlert] = useState<{ meses: number } | null>(null)

    useEffect(() => {
        if (!hasRole('SUPERADMIN')) return
        let active = true
        backupsApi
            .estado()
            .then((status) => {
                if (active && status.alerta) setBackupAlert({meses: status.mesesDeAlerta})
            })
            .catch(() => {
                // Non-critical: if the status check fails, simply skip the banner.
            })
        return () => {
            active = false
        }
    }, [hasRole])

    return (
        <div className="min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[16rem_1fr]">
            {/* Mobile topbar */}
            <div className="lg:hidden flex items-center justify-between bg-institutional text-white px-4 py-3">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Abrir menú"
                    className="p-1"
                >
                    <Menu className="w-5 h-5" aria-hidden="true"/>
                </button>
                <span className="font-display font-semibold">Digesto — Administración</span>
                <div className="w-7" aria-hidden="true"/>
            </div>

            {/* Mobile drawer */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div
                        className="absolute inset-0 bg-neutral-900/50"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                            <span className="font-display font-semibold text-institutional">Digesto Escuela</span>
                            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
                                <X className="w-5 h-5" aria-hidden="true"/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <AdminSidebar onNavigate={() => setSidebarOpen(false)}/>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col border-r border-neutral-200 bg-white">
                <div className="px-4 py-4 border-b border-neutral-200">
                    <NavLink to="/" className="font-display font-semibold text-institutional text-lg">
                        Digesto Escuela
                    </NavLink>
                    <p className="text-xs text-neutral-500 mt-0.5">Panel administrativo</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <AdminSidebar/>
                </div>
                <div className="px-4 py-3 border-t border-neutral-200 text-xs text-neutral-500">
                    <p className="truncate">{user?.userId}</p>
                    <p>{hasRole('SUPERADMIN') ? 'Super administrador' : 'Administrador'}</p>
                </div>
            </aside>

            <div className="flex flex-col min-w-0">
                <div
                    className="hidden lg:flex items-center justify-end gap-4 border-b border-neutral-200 bg-white px-6 py-3">
                    <NavLink
                        to="/"
                        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-institutional transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" aria-hidden="true"/>
                        Ver sitio público
                    </NavLink>
                    <button
                        type="button"
                        onClick={() => void logout()}
                        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-institutional transition-colors"
                    >
                        <LogOut className="w-4 h-4" aria-hidden="true"/>
                        Cerrar sesión
                    </button>
                </div>

                {backupAlert && (
                    <div
                        className="flex items-start gap-2 bg-amber-50 border-b border-amber-200 text-amber-900 px-4 sm:px-6 py-3 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true"/>
                        <p>
                            No se ha realizado un backup en los últimos {backupAlert.meses} meses.{' '}
                            <NavLink to="/admin/backups" className="underline font-medium">
                                Ir a Backups
                            </NavLink>
                        </p>
                    </div>
                )}

                <main className="flex-1 p-4 sm:p-6">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}
