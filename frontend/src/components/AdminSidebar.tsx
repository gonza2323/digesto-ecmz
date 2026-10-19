import {Clock, DatabaseBackup, FilePlus, FileText, KeyRound, Landmark, Mail, Tags, Users,} from 'lucide-react'
import {NavLink} from 'react-router-dom'
import {useAuth} from '@/hooks/useAuth'
import type {UserRole} from '@/types/auth'

interface NavItem {
    label: string
    to: string
    icon: typeof FileText
    end?: boolean
    requiresRole?: UserRole
}

const navItems: NavItem[] = [
    {label: 'Normativas', to: '/admin/normativas', icon: FileText, end: true},
    {label: 'Nueva normativa', to: '/admin/normativas/nueva', icon: FilePlus},
    {
        label: 'Pendientes de aprobación',
        to: '/admin/normativas/pendientes',
        icon: Clock,
        requiresRole: 'SUPERADMIN',
    },
    {label: 'Tipos de normativa', to: '/admin/tipos-documento', icon: Tags},
    {label: 'Autoridades', to: '/admin/autoridades', icon: Landmark},
    {label: 'Usuarios', to: '/admin/usuarios', icon: Users, requiresRole: 'SUPERADMIN'},
    {label: 'Backups', to: '/admin/backups', icon: DatabaseBackup, requiresRole: 'SUPERADMIN'},
    {label: 'Plantilla de correo', to: '/admin/configuracion/correo', icon: Mail},
    {label: 'Cambiar contraseña', to: '/admin/cambiar-password', icon: KeyRound},
]

export function AdminSidebar({onNavigate}: { onNavigate?: () => void }) {
    const {hasRole} = useAuth()
    const visibleItems = navItems.filter((item) => !item.requiresRole || hasRole(item.requiresRole))

    return (
        <nav className="p-3 space-y-1" aria-label="Navegación administrativa">
            {visibleItems.map((item) => {
                const Icon = item.icon
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className={({isActive}) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-institutional-50 text-institutional'
                                    : 'text-neutral-700 hover:bg-neutral-100'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true"/>
                        {item.label}
                    </NavLink>
                )
            })}
        </nav>
    )
}
