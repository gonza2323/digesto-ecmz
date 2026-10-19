import type {ReactNode} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '@/hooks/useAuth'
import type {UserRole} from '@/types/auth'

export function RoleRoute({role, children}: { role: UserRole; children: ReactNode }) {
    const {hasRole} = useAuth()

    if (!hasRole(role)) {
        return <Navigate to="/admin/normativas" replace/>
    }

    return <>{children}</>
}
