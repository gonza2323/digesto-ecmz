import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Link} from 'react-router-dom'
import {authApi} from '@/api/auth'
import {AuthCard} from '@/components/AuthCard'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {getErrorMessage} from '@/utils/errors'

interface FormValues {
    email: string
}

export function ForgotPasswordPage() {
    const [sent, setSent] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({defaultValues: {email: ''}})

    async function onSubmit(values: FormValues) {
        setSubmitError(null)
        try {
            await authApi.forgotPassword({email: values.email.trim()})
            setSent(true)
        } catch (error) {
            setSubmitError(getErrorMessage(error))
        }
    }

    if (sent) {
        return (
            <AuthCard title="Revise su correo">
                <div className="space-y-4">
                    <Alert variant="success">
                        Si el email corresponde a una cuenta registrada, recibirá un enlace para definir una nueva
                        contraseña. El enlace vence pasado un tiempo, por lo que le recomendamos usarlo pronto.
                    </Alert>
                    <Link to="/login" className="block text-sm text-center text-institutional hover:underline">
                        Volver a iniciar sesión
                    </Link>
                </div>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title="Recuperar contraseña"
            subtitle="Ingrese el email de su cuenta y le enviaremos un enlace para crear una nueva contraseña."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {submitError && <Alert variant="error">{submitError}</Alert>}

                <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        hasError={!!errors.email}
                        aria-invalid={!!errors.email}
                        {...register('email', {
                            required: 'Ingrese su email',
                            pattern: {value: /^\S+@\S+\.\S+$/, message: 'Ingrese un email válido'},
                        })}
                    />
                </FormField>

                <Button type="submit" fullWidth loading={isSubmitting}>
                    Enviar enlace
                </Button>

                <p className="text-sm text-center">
                    <Link to="/login" className="text-institutional hover:underline">
                        Volver a iniciar sesión
                    </Link>
                </p>
            </form>
        </AuthCard>
    )
}
