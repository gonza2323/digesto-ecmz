import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Link, Navigate, useLocation, useNavigate} from 'react-router-dom'
import {AuthCard} from '@/components/AuthCard'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {useAuth} from '@/hooks/useAuth'
import type {LoginRequest} from '@/types/auth'
import {getErrorMessage} from '@/utils/errors'

interface LocationState {
    from?: { pathname: string; search?: string }
}

export function LoginPage() {
    const {user, login} = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginRequest>({defaultValues: {email: '', password: ''}})

    const from = (location.state as LocationState | null)?.from
    const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/admin'

    if (user) return <Navigate to={redirectTo} replace/>

    async function onSubmit(values: LoginRequest) {
        setSubmitError(null)
        try {
            await login({email: values.email.trim(), password: values.password})
            navigate(redirectTo, {replace: true})
        } catch (error) {
            setSubmitError(getErrorMessage(error))
        }
    }

    return (
        <AuthCard title="Iniciar sesión" subtitle="Acceso para personal administrativo del digesto.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {submitError && <Alert variant="error">{submitError}</Alert>}

                <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="username"
                        hasError={!!errors.email}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email', {
                            required: 'Ingrese su email',
                            pattern: {value: /^\S+@\S+\.\S+$/, message: 'Ingrese un email válido'},
                        })}
                    />
                </FormField>

                <FormField label="Contraseña" htmlFor="password" required error={errors.password?.message}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        hasError={!!errors.password}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        {...register('password', {required: 'Ingrese su contraseña'})}
                    />
                </FormField>

                <Button type="submit" fullWidth loading={isSubmitting}>
                    Ingresar
                </Button>

                <p className="text-sm text-center">
                    <Link to="/forgot-password" className="text-institutional hover:underline">
                        ¿Olvidó su contraseña?
                    </Link>
                </p>
            </form>
        </AuthCard>
    )
}
