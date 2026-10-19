import type {ReactNode} from 'react'
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom'
import {render} from '@testing-library/react'
import {AuthContext, type AuthContextValue} from '@/context/AuthContext'
import type {AuthUser, UserRole} from '@/types/auth'

export function makeAuth(user: AuthUser | null): AuthContextValue {
    return {
        user,
        initializing: false,
        login: async () => {
            throw new Error('not used')
        },
        logout: async () => {
        },
        refresh: async () => {
        },
        hasRole: (role: UserRole) => user?.roles.includes(role) ?? false,
    }
}

function LocationProbe() {
    const location = useLocation()
    return <div data-testid="location">{location.pathname}</div>
}

/** Renders `element` at `path` inside a router with the given auth state, plus a
 * probe that exposes the final location so tests can assert redirects. */
export function renderAt(path: string, auth: AuthContextValue, routes: ReactNode) {
    return render(
        <AuthContext.Provider value={auth}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>{routes}</Routes>
                <LocationProbe/>
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

export {Route}
