import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {ProtectedRoute} from '@/components/ProtectedRoute'
import {RoleRoute} from '@/components/RoleRoute'
import type {AuthUser} from '@/types/auth'
import {makeAuth, renderAt, Route} from '@/test/renderWithAuth'

const admin: AuthUser = {userId: 'u1', roles: ['ADMIN'], mustChangePassword: false}
const superadmin: AuthUser = {userId: 'u2', roles: ['SUPERADMIN'], mustChangePassword: false}
const mustChange: AuthUser = {userId: 'u3', roles: ['ADMIN'], mustChangePassword: true}

const routes = (
    <>
        <Route path="/login" element={<p>login page</p>}/>
        <Route
            path="/admin/normativas"
            element={
                <ProtectedRoute>
                    <p>lista</p>
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/cambiar-password"
            element={
                <ProtectedRoute>
                    <p>cambiar password</p>
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/usuarios"
            element={
                <ProtectedRoute>
                    <RoleRoute role="SUPERADMIN">
                        <p>usuarios</p>
                    </RoleRoute>
                </ProtectedRoute>
            }
        />
    </>
)

describe('ProtectedRoute', () => {
    it('redirects anonymous visitors to /login', () => {
        renderAt('/admin/normativas', makeAuth(null), routes)
        expect(screen.getByTestId('location')).toHaveTextContent('/login')
        expect(screen.getByText('login page')).toBeInTheDocument()
    })

    it('lets an authenticated admin in', () => {
        renderAt('/admin/normativas', makeAuth(admin), routes)
        expect(screen.getByText('lista')).toBeInTheDocument()
    })

    it('forces users with mustChangePassword to the change-password screen', () => {
        renderAt('/admin/normativas', makeAuth(mustChange), routes)
        expect(screen.getByTestId('location')).toHaveTextContent('/admin/cambiar-password')
        expect(screen.getByText('cambiar password')).toBeInTheDocument()
    })

    it('shows a loading state (not the page) while the session is being checked', () => {
        renderAt('/admin/normativas', {...makeAuth(null), initializing: true}, routes)
        expect(screen.queryByText('login page')).not.toBeInTheDocument()
        expect(screen.queryByText('lista')).not.toBeInTheDocument()
    })
})

describe('RoleRoute', () => {
    it('blocks ADMIN from SUPERADMIN-only routes', () => {
        renderAt('/admin/usuarios', makeAuth(admin), routes)
        expect(screen.queryByText('usuarios')).not.toBeInTheDocument()
        expect(screen.getByTestId('location')).toHaveTextContent('/admin/normativas')
    })

    it('allows SUPERADMIN', () => {
        renderAt('/admin/usuarios', makeAuth(superadmin), routes)
        expect(screen.getByText('usuarios')).toBeInTheDocument()
    })
})
