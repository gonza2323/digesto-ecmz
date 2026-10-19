import {useEffect, useState} from 'react'
import {useForm} from 'react-hook-form'
import {settingsApi} from '@/api/settings'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {ErrorState, LoadingState} from '@/components/ui/States'
import {Textarea} from '@/components/ui/Textarea'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useToast} from '@/hooks/useToast'
import type {PlantillaCorreo} from '@/types/backup'
import {getErrorMessage} from '@/utils/errors'

export function PlantillaCorreoPage() {
    const {showToast} = useToast()
    const {data, loading, error, reload} = useAsyncData(() => settingsApi.getPlantillaCorreo(), [])
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting, isDirty},
    } = useForm<PlantillaCorreo>({defaultValues: {asunto: '', cuerpo: ''}})

    useEffect(() => {
        if (data) reset(data)
    }, [data, reset])

    async function onSubmit(values: PlantillaCorreo) {
        setSubmitError(null)
        try {
            const saved = await settingsApi.updatePlantillaCorreo(values)
            reset(saved)
            showToast('success', 'La plantilla se guardó correctamente.')
        } catch (err) {
            setSubmitError(getErrorMessage(err))
        }
    }

    if (loading && !data) return <LoadingState/>
    if (error) return <ErrorState message={error} onRetry={reload}/>

    return (
        <div className="max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Plantilla de correo</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">
                Texto de la notificación que se envía a los correos asociados cuando se aprueba una normativa.
            </p>

            <Alert variant="info" className="mb-5">
                Puede usar <code className="font-mono text-xs bg-white/70 px-1 rounded">{'{titulo}'}</code> para el
                título de la normativa y <code
                className="font-mono text-xs bg-white/70 px-1 rounded">{'{enlace}'}</code>{' '}
                para el enlace a su página. Se reemplazan al enviar.
            </Alert>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
                noValidate
            >
                {submitError && <Alert variant="error">{submitError}</Alert>}

                <FormField label="Asunto" htmlFor="asunto" required error={errors.asunto?.message}>
                    <Input
                        id="asunto"
                        hasError={!!errors.asunto}
                        {...register('asunto', {validate: (v) => v.trim().length > 0 || 'Ingrese el asunto'})}
                    />
                </FormField>

                <FormField label="Cuerpo" htmlFor="cuerpo" required error={errors.cuerpo?.message}>
                    <Textarea
                        id="cuerpo"
                        rows={9}
                        maxLength={4000}
                        hasError={!!errors.cuerpo}
                        {...register('cuerpo', {validate: (v) => v.trim().length > 0 || 'Ingrese el cuerpo'})}
                    />
                </FormField>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                    <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                        Guardar plantilla
                    </Button>
                </div>
            </form>
        </div>
    )
}
