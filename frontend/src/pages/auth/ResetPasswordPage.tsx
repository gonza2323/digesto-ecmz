import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {authApi} from '@/api/auth'
import {AuthCard} from '@/components/AuthCard'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {useToast} from '@/hooks/useToast'
import {getErrorMessage, getFieldErrors} from '@/utils/errors'

interface FormValues {
    newPassword: string
    confirmPassword: string
}

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const {showToast} = useToast()
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({defaultValues: {newPassword: '', confirmPassword: ''}})

    if (!token) {
        return (
            <AuthCard title="Enlace inválido">
                <div className="space-y-4">
                    <Alert variant="error">
                        El enlace de recuperación no es válido o está incompleto. Solicite uno nuevo.
                    </Alert>
                    <Link to="/forgot-password"
                          className="block text-sm text-center text-institutional hover:underline">
                        Solicitar un nuevo enlace
                    </Link>
                </div>
            </AuthCard>
        )
    }

    async function onSubmit(values: FormValues) {
        setSubmitError(null)
        try {
            await authApi.resetPassword({token: token as string, newPassword: values.newPassword})
            showToast('success', 'Contraseña actualizada. Ya puede iniciar sesión.')
            navigate('/login', {replace: true})
        } catch (error) {
            const fieldErrors = getFieldErrors(error)
            if (fieldErrors?.newPassword) {
                setError('newPassword', {message: fieldErrors.newPassword})
            } else {
                setSubmitError(getErrorMessage(error))
            }
        }
    }

    return (
        <AuthCard title="Nueva contraseña" subtitle="Elija una contraseña de al menos 8 caracteres.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {submitError && (
                    <Alert variant="error">
                        {submitError}{' '}
                        <Link to="/forgot-password" className="underline font-medium">
                            Solicitar un nuevo enlace
                        </Link>
                    </Alert>
                )}

                <FormField label="Nueva contraseña" htmlFor="newPassword" required error={errors.newPassword?.message}>
                    <Input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        hasError={!!errors.newPassword}
                        aria-invalid={!!errors.newPassword}
                        {...register('newPassword', {
                            required: 'Ingrese la nueva contraseña',
                            minLength: {value: 8, message: 'La contraseña debe tener al menos 8 caracteres'},
                        })}
                    />
                </FormField>

                <FormField
                    label="Repetir contraseña"
                    htmlFor="confirmPassword"
                    required
                    error={errors.confirmPassword?.message}
                >
                    <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        hasError={!!errors.confirmPassword}
                        aria-invalid={!!errors.confirmPassword}
                        {...register('confirmPassword', {
                            required: 'Repita la contraseña',
                            validate: (value) => value === getValues('newPassword') || 'Las contraseñas no coinciden',
                        })}
                    />
                </FormField>

                <Button type="submit" fullWidth loading={isSubmitting}>
                    Guardar contraseña
                </Button>
            </form>
        </AuthCard>
    )
}
