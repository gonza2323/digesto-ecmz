import {Plus, Save, Send, X} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router-dom'
import {autoridadesApi} from '@/api/autoridades'
import {normativasApi} from '@/api/normativas'
import {tiposDocumentoApi} from '@/api/tiposDocumento'
import {FileDropzone} from '@/components/FileDropzone'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {Select} from '@/components/ui/Select'
import {ErrorState, LoadingState} from '@/components/ui/States'
import {Textarea} from '@/components/ui/Textarea'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useToast} from '@/hooks/useToast'
import type {NormativaFormValues} from '@/types/normativa'
import {getErrorMessage, getFieldErrors} from '@/utils/errors'

/** Form state: everything in NormativaFormDto except the fields managed outside RHF. */
type FormValues = Omit<NormativaFormValues, 'notificaciones' | 'enviarAAprobacion'>

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

/** Matches spring.servlet.multipart.max-file-size in the backend. */
const MAX_FILE_BYTES = 50 * 1024 * 1024

const positiveInteger = (message: string) => (value: number) =>
    (Number.isInteger(value) && value > 0) || message

const emptyValues: FormValues = {
    number: NaN,
    title: '',
    description: '',
    releaseDate: '',
    autoridadId: '',
    tipoDocumentoId: '',
    recordNumber: NaN,
    recordTitle: '',
}

export function NormativaFormPage() {
    const {id} = useParams<{ id: string }>()
    const isEdit = Boolean(id)
    const navigate = useNavigate()
    const {showToast} = useToast()

    const [archivo, setArchivo] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | undefined>()
    const [emails, setEmails] = useState<string[]>([])
    const [emailDraft, setEmailDraft] = useState('')
    const [emailError, setEmailError] = useState<string | undefined>()
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [expedienteEnUso, setExpedienteEnUso] = useState(false)
    const submitMode = useRef<'borrador' | 'aprobacion'>('borrador')
    const originalRecordNumber = useRef<number | null>(null)

    const catalogs = useAsyncData(
        () => Promise.all([tiposDocumentoApi.list(), autoridadesApi.list()]),
        [],
    )
    const [tipos, autoridades] = catalogs.data ?? [[], []]

    const existing = useAsyncData(
        () => (id ? normativasApi.findAdmin(id) : Promise.resolve(null)),
        [id],
    )

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({defaultValues: emptyValues})

    // Prefill when editing.
    useEffect(() => {
        const normativa = existing.data
        if (!normativa) return
        originalRecordNumber.current = normativa.recordNumber
        reset({
            number: normativa.number,
            title: normativa.title,
            description: normativa.description,
            releaseDate: normativa.releaseDate,
            autoridadId: normativa.autoridadId,
            tipoDocumentoId: normativa.tipoDocumentoId,
            recordNumber: normativa.recordNumber,
            recordTitle: normativa.recordTitle,
        })
        setEmails(normativa.notificaciones ?? [])
    }, [existing.data, reset])

    // Informational check (never blocks): warn when the expediente number is already used.
    const recordNumber = watch('recordNumber')
    useEffect(() => {
        if (!Number.isInteger(recordNumber) || recordNumber <= 0) {
            setExpedienteEnUso(false)
            return
        }
        if (isEdit && recordNumber === originalRecordNumber.current) {
            setExpedienteEnUso(false)
            return
        }
        let active = true
        const timer = window.setTimeout(() => {
            normativasApi
                .expedienteEnUso(recordNumber)
                .then((inUse) => active && setExpedienteEnUso(inUse))
                .catch(() => active && setExpedienteEnUso(false))
        }, 400)
        return () => {
            active = false
            window.clearTimeout(timer)
        }
    }, [recordNumber, isEdit])

    function addEmail() {
        const value = emailDraft.trim()
        if (!value) return
        if (!EMAIL_PATTERN.test(value)) {
            setEmailError('Ingrese una dirección de correo válida')
            return
        }
        if (emails.some((email) => email.toLowerCase() === value.toLowerCase())) {
            setEmailError('Esa dirección ya fue agregada')
            return
        }
        setEmails((current) => [...current, value])
        setEmailDraft('')
        setEmailError(undefined)
    }

    async function onSubmit(values: FormValues) {
        setSubmitError(null)

        if (!isEdit && !archivo) {
            setFileError('Adjunte el archivo PDF de la normativa')
            return
        }
        if (archivo && archivo.type !== 'application/pdf') {
            setFileError('El archivo debe ser un PDF')
            return
        }
        if (archivo && archivo.size > MAX_FILE_BYTES) {
            setFileError('El archivo supera los 50MB permitidos')
            return
        }
        setFileError(undefined)

        const payload: NormativaFormValues = {
            ...values,
            title: values.title.trim(),
            description: values.description.trim(),
            recordTitle: values.recordTitle.trim(),
            notificaciones: emails,
            enviarAAprobacion: submitMode.current === 'aprobacion',
        }

        try {
            const saved =
                isEdit && id
                    ? await normativasApi.update(id, payload, archivo)
                    : await normativasApi.create(payload, archivo as File)
            showToast(
                'success',
                payload.enviarAAprobacion
                    ? 'La normativa fue enviada a aprobación.'
                    : 'La normativa se guardó como borrador.',
            )
            navigate(`/admin/normativas/${saved.id}`, {replace: true})
        } catch (error) {
            const fieldErrors = getFieldErrors(error)
            if (fieldErrors) {
                for (const [field, message] of Object.entries(fieldErrors)) {
                    if (field in emptyValues) setError(field as keyof FormValues, {message})
                }
            }
            setSubmitError(getErrorMessage(error))
        }
    }

    if (isEdit && existing.loading && !existing.data) return <LoadingState label="Cargando normativa…"/>
    if (isEdit && existing.error) return <ErrorState message={existing.error} onRetry={existing.reload}/>

    const publishedWarning = isEdit && existing.data?.estado === 'PUBLICADA'

    return (
        <div className="max-w-4xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">
                {isEdit ? 'Editar normativa' : 'Nueva normativa'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">
                Complete los campos. Puede guardar como borrador o enviarla a aprobación.
            </p>

            {publishedWarning && (
                <Alert variant="warning" className="mb-4">
                    <strong>La normativa quedará oculta hasta que la modificación sea aprobada.</strong> Si la
                    modificación se rechaza, se restaurará la versión publicada anterior.
                </Alert>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
                noValidate
            >
                {submitError && <Alert variant="error">{submitError}</Alert>}

                <FileDropzone
                    file={archivo}
                    onChange={(file) => {
                        setArchivo(file)
                        setFileError(undefined)
                    }}
                    currentFile={
                        existing.data ? {name: existing.data.archivoName, size: existing.data.archivoSize} : null
                    }
                    error={fileError}
                    required={!isEdit}
                />

                <FormField label="Título" htmlFor="title" required error={errors.title?.message}>
                    <Input
                        id="title"
                        hasError={!!errors.title}
                        placeholder="Ej: Reglamento Interno 2026"
                        {...register('title', {validate: (v) => v.trim().length > 0 || 'Ingrese el título'})}
                    />
                </FormField>

                <FormField label="Descripción" htmlFor="description" required error={errors.description?.message}>
                    <Textarea
                        id="description"
                        rows={4}
                        maxLength={2000}
                        hasError={!!errors.description}
                        {...register('description', {
                            validate: (v) => v.trim().length > 0 || 'Ingrese la descripción',
                        })}
                    />
                </FormField>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    <FormField label="Tipo de normativa" htmlFor="tipoDocumentoId" required
                               error={errors.tipoDocumentoId?.message}>
                        <Select
                            id="tipoDocumentoId"
                            hasError={!!errors.tipoDocumentoId}
                            {...register('tipoDocumentoId', {required: 'Seleccione el tipo de normativa'})}
                        >
                            <option value="">Seleccione un tipo</option>
                            {tipos.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Autoridad" htmlFor="autoridadId" required error={errors.autoridadId?.message}>
                        <Select
                            id="autoridadId"
                            hasError={!!errors.autoridadId}
                            {...register('autoridadId', {required: 'Seleccione la autoridad'})}
                        >
                            <option value="">Seleccione una autoridad</option>
                            {autoridades.map((autoridad) => (
                                <option key={autoridad.id} value={autoridad.id}>
                                    {autoridad.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField
                        label="Número de normativa"
                        htmlFor="number"
                        required
                        error={errors.number?.message}
                        hint="No puede repetirse dentro del mismo tipo y año de publicación."
                    >
                        <Input
                            id="number"
                            type="number"
                            min={1}
                            placeholder="Ej: 145"
                            hasError={!!errors.number}
                            {...register('number', {
                                valueAsNumber: true,
                                validate: positiveInteger('Ingrese un número mayor a cero'),
                            })}
                        />
                    </FormField>

                    <FormField label="Fecha de publicación" htmlFor="releaseDate" required
                               error={errors.releaseDate?.message}>
                        <Input
                            id="releaseDate"
                            type="date"
                            hasError={!!errors.releaseDate}
                            {...register('releaseDate', {required: 'Ingrese la fecha de publicación'})}
                        />
                    </FormField>

                    <FormField
                        label="Número de expediente"
                        htmlFor="recordNumber"
                        required
                        error={errors.recordNumber?.message}
                    >
                        <Input
                            id="recordNumber"
                            type="number"
                            min={1}
                            hasError={!!errors.recordNumber}
                            {...register('recordNumber', {
                                valueAsNumber: true,
                                validate: positiveInteger('Ingrese un número de expediente mayor a cero'),
                            })}
                        />
                    </FormField>

                    <FormField label="Título del expediente" htmlFor="recordTitle" required
                               error={errors.recordTitle?.message}>
                        <Input
                            id="recordTitle"
                            hasError={!!errors.recordTitle}
                            {...register('recordTitle', {
                                validate: (v) => v.trim().length > 0 || 'Ingrese el título del expediente',
                            })}
                        />
                    </FormField>
                </div>

                {expedienteEnUso && (
                    <Alert variant="warning">
                        El expediente N° {recordNumber} ya fue utilizado en otra normativa. Puede continuar, pero
                        verifique que sea correcto.
                    </Alert>
                )}

                <div>
                    <label htmlFor="emailDraft" className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                        Correos a notificar al aprobar
                    </label>
                    <div className="flex gap-2">
                        <Input
                            id="emailDraft"
                            type="email"
                            placeholder="nombre@ejemplo.com"
                            value={emailDraft}
                            hasError={!!emailError}
                            onChange={(event) => {
                                setEmailDraft(event.target.value)
                                setEmailError(undefined)
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    addEmail()
                                }
                            }}
                        />
                        <Button type="button" variant="secondary" onClick={addEmail}>
                            <Plus className="w-4 h-4" aria-hidden="true"/>
                            Agregar
                        </Button>
                    </div>
                    {emailError && (
                        <p role="alert" className="mt-1 text-xs text-red-600">
                            {emailError}
                        </p>
                    )}
                    {emails.length > 0 && (
                        <ul className="flex flex-wrap gap-2 mt-3">
                            {emails.map((email) => (
                                <li
                                    key={email}
                                    className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-full pl-3 pr-1.5 py-1"
                                >
                                    {email}
                                    <button
                                        type="button"
                                        onClick={() => setEmails((current) => current.filter((item) => item !== email))}
                                        aria-label={`Quitar ${email}`}
                                        className="p-0.5 rounded-full hover:bg-neutral-200"
                                    >
                                        <X className="w-3.5 h-3.5" aria-hidden="true"/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div
                    className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-neutral-200">
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={() => (submitMode.current = 'borrador')}
                    >
                        <Save className="w-4 h-4" aria-hidden="true"/>
                        Guardar borrador
                    </Button>
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        onClick={() => (submitMode.current = 'aprobacion')}
                    >
                        <Send className="w-4 h-4" aria-hidden="true"/>
                        Enviar a aprobación
                    </Button>
                </div>
            </form>
        </div>
    )
}
