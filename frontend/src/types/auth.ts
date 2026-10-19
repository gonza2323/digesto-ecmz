export type UserRole = 'ADMIN' | 'SUPERADMIN'

/** AuthUserDto */
export interface AuthUser {
    userId: string
    roles: UserRole[]
    mustChangePassword: boolean
}

/** LoginRequestDto */
export interface LoginRequest {
    email: string
    password: string
}

/** ChangePasswordDto */
export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

/** ForgotPasswordDto */
export interface ForgotPasswordRequest {
    email: string
}

/** ResetPasswordDto */
export interface ResetPasswordRequest {
    token: string
    newPassword: string
}

/** UsuarioDto */
export interface Usuario {
    id: string
    firstname: string
    lastname: string
    email: string
    role: UserRole
    mustChangePassword: boolean
}

/** UsuarioFormDto */
export interface UsuarioFormValues {
    firstname: string
    lastname: string
    email: string
    role: UserRole
}
