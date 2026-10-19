import {createContext, type ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import {authApi} from '@/api/auth'
import type {AuthUser, LoginRequest, UserRole} from '@/types/auth'

export interface AuthContextValue {
    user: AuthUser | null
    /** True while the initial session check (GET /api/auth/me) is in flight. */
    initializing: boolean
    login: (credentials: LoginRequest) => Promise<AuthUser>
    logout: () => Promise<void>
    /** Re-fetches /api/auth/me — used after a password change updates mustChangePassword. */
    refresh: () => Promise<void>
    hasRole: (role: UserRole) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        let active = true
        authApi.me().then((current) => {
            if (active) {
                setUser(current)
                setInitializing(false)
            }
        })
        return () => {
            active = false
        }
    }, [])

    const login = useCallback(async (credentials: LoginRequest) => {
        const authUser = await authApi.login(credentials)
        setUser(authUser)
        return authUser
    }, [])

    const logout = useCallback(async () => {
        await authApi.logout()
        setUser(null)
    }, [])

    const refresh = useCallback(async () => {
        const current = await authApi.me()
        setUser(current)
    }, [])

    const hasRole = useCallback((role: UserRole) => user?.roles.includes(role) ?? false, [user])

    const value = useMemo(
        () => ({user, initializing, login, logout, refresh, hasRole}),
        [user, initializing, login, logout, refresh, hasRole],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
