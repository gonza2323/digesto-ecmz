import {http} from '@/api/http'
import type {
    AuthUser,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
} from '@/types/auth'

export const authApi = {
    async login(credentials: LoginRequest): Promise<AuthUser> {
        const {data} = await http.post<AuthUser>('/api/auth/login', credentials)
        return data
    },

    async logout(): Promise<void> {
        await http.post('/api/auth/logout')
    },

    /** Returns the current session's user, or null if there is no active session. */
    async me(): Promise<AuthUser | null> {
        try {
            const {data} = await http.get<AuthUser>('/api/auth/me')
            return data
        } catch {
            return null
        }
    },

    async changePassword(payload: ChangePasswordRequest): Promise<void> {
        await http.post('/api/auth/change-password', payload)
    },

    async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
        await http.post('/api/auth/forgot-password', payload)
    },

    async resetPassword(payload: ResetPasswordRequest): Promise<void> {
        await http.post('/api/auth/reset-password', payload)
    },
}
