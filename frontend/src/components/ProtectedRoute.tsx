import type {ReactNode} from 'react'
import {Navigate, useLocation} from 'react-router-dom'
import {LoadingState} from '@/components/ui/States'
import {useAuth} from '@/hooks/useAuth'

export function ProtectedRoute({children}: { children: ReactNode }) {
    const {user, initializing} = useAuth()
    const location = useLocation()

    if (initializing) return <LoadingState label="Verificando sesión…"/>

    if (!user) {
        return <Navigate to="/login" state={{from: location}} replace/>
    }

    if (user.mustChangePassword && location.pathname !== '/admin/cambiar-password') {
        return <Navigate to="/admin/cambiar-password" replace/>
    }

    return <>{children}</>
}
