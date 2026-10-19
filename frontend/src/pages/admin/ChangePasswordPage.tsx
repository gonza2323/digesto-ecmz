import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import {authApi} from '@/api/auth'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {useAuth} from '@/hooks/useAuth'
import {useToast} from '@/hooks/useToast'
import {getErrorMessage, getFieldErrors} from '@/utils/errors'

interface FormValues {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export function ChangePasswordPage() {
    const {user, refresh} = useAuth()
    const {showToast} = useToast()
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const forced = user?.mustChangePassword ?? false

    const {
        register,
        handleSubmit,
        getValues,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({
        defaultValues: {currentPassword: '', newPassword: '', confirmPassword: ''},
    })

    async function onSubmit(values: FormValues) {
        setSubmitError(null)
        try {
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            })
            await refresh()
            showToast('success', 'Contraseña actualizada correctamente.')
            navigate('/admin/normativas', {replace: true})
        } catch (error) {
            const fieldErrors = getFieldErrors(error)
            if (fieldErrors?.newPassword || fieldErrors?.currentPassword) {
                if (fieldErrors.newPassword) setError('newPassword', {message: fieldErrors.newPassword})
                if (fieldErrors.currentPassword) setError('currentPassword', {message: fieldErrors.currentPassword})
            } else {
                setSubmitError(getErrorMessage(error))
            }
        }
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Cambiar contraseña</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">
                Elija una contraseña de al menos 8 caracteres.
            </p>

            {forced && (
                <Alert variant="warning" className="mb-4">
                    Por seguridad, debe cambiar su contraseña provisoria antes de continuar usando el sistema.
                </Alert>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
                noValidate
            >
                {submitError && <Alert variant="error">{submitError}</Alert>}

                <FormField
                    label="Contraseña actual"
                    htmlFor="currentPassword"
                    required
                    error={errors.currentPassword?.message}
                >
                    <Input
                        id="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        hasError={!!errors.currentPassword}
                        aria-invalid={!!errors.currentPassword}
                        {...register('currentPassword', {required: 'Ingrese su contraseña actual'})}
                    />
                </FormField>

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
                    label="Repetir nueva contraseña"
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
                            required: 'Repita la nueva contraseña',
                            validate: (value) => value === getValues('newPassword') || 'Las contraseñas no coinciden',
                        })}
                    />
                </FormField>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                    <Button type="submit" loading={isSubmitting}>
                        Guardar contraseña
                    </Button>
                </div>
            </form>
        </div>
    )
}
