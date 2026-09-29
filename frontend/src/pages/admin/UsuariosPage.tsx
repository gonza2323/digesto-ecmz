import {Pencil, Plus, Trash2} from 'lucide-react'
import {type FormEvent, useState} from 'react'
import {useForm} from 'react-hook-form'
import {usuariosApi} from '@/api/usuarios'
import {Alert} from '@/components/ui/Alert'
import {Badge} from '@/components/ui/Badge'
import {Button} from '@/components/ui/Button'
import {ConfirmDialog} from '@/components/ui/ConfirmDialog'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {Modal} from '@/components/ui/Modal'
import {Select} from '@/components/ui/Select'
import {EmptyState, ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useAuth} from '@/hooks/useAuth'
import {useToast} from '@/hooks/useToast'
import type {Usuario, UsuarioFormValues} from '@/types/auth'
import {getErrorMessage, getFieldErrors} from '@/utils/errors'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

const roleLabels = {ADMIN: 'Administrador', SUPERADMIN: 'Super administrador'} as const

export function UsuariosPage() {
    const {user: current} = useAuth()
    const {showToast} = useToast()
    const {data, loading, error, reload} = useAsyncData(() => usuariosApi.list(), [])

    const [editing, setEditing] = useState<Usuario | 'new' | null>(null)
    const [deleting, setDeleting] = useState<Usuario | null>(null)

    async function handleDelete(usuario: Usuario) {
        try {
            await usuariosApi.remove(usuario.id)
            showToast('success', 'El usuario fue eliminado.')
            setDeleting(null)
            reload()
        } catch (err) {
            setDeleting(null)
            showToast('error', getErrorMessage(err))
        }
    }

    return (
        <div className="max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Usuarios</h1>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                        Cuentas administrativas. Al crear un usuario, el sistema genera una contraseña provisoria y se
                        la envía por correo.
                    </p>
                </div>
                <Button onClick={() => setEditing('new')}>
                    <Plus className="w-4 h-4" aria-hidden="true"/>
                    Nuevo usuario
                </Button>
            </div>

            {loading && !data ? (
                <LoadingState/>
            ) : error ? (
                <ErrorState message={error} onRetry={reload}/>
            ) : data && data.length === 0 ? (
                <EmptyState title="No hay usuarios"/>
            ) : data ? (
                <ul className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                    {data.map((usuario) => {
                        const isSelf = usuario.id === current?.userId
                        return (
                            <li
                                key={usuario.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-neutral-900">
                                        {usuario.lastname}, {usuario.firstname}
                                        {isSelf && <span className="ml-2 text-xs text-neutral-500">(usted)</span>}
                                    </p>
                                    <p className="text-sm text-neutral-500 truncate">{usuario.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className="bg-institutional-50 text-institutional">{roleLabels[usuario.role]}</Badge>
                                    {usuario.mustChangePassword && (
                                        <Badge className="bg-amber-100 text-amber-800">Debe cambiar contraseña</Badge>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setEditing(usuario)}
                                        aria-label={`Editar ${usuario.firstname} ${usuario.lastname}`}
                                        className="p-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" aria-hidden="true"/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleting(usuario)}
                                        disabled={isSelf}
                                        title={isSelf ? 'No puede eliminar su propio usuario' : undefined}
                                        aria-label={`Eliminar ${usuario.firstname} ${usuario.lastname}`}
                                        className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" aria-hidden="true"/>
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) : null}

            {editing && (
                <UsuarioFormModal
                    usuario={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={(created) => {
                        setEditing(null)
                        showToast(
                            'success',
                            created
                                ? 'Usuario creado. Se le envió por correo una contraseña provisoria que deberá cambiar al ingresar.'
                                : 'Se guardaron los cambios.',
                        )
                        reload()
                    }}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title="Eliminar usuario"
                    description={
                        <>
                            ¿Seguro que desea eliminar a{' '}
                            <strong>
                                {deleting.firstname} {deleting.lastname}
                            </strong>
                            ? Ya no podrá iniciar sesión.
                        </>
                    }
                    confirmLabel="Eliminar"
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => handleDelete(deleting)}
                />
            )}
        </div>
    )
}

function UsuarioFormModal({
                              usuario,
                              onClose,
                              onSaved,
                          }: {
    usuario: Usuario | null
    onClose: () => void
    onSaved: (created: boolean) => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<UsuarioFormValues>({
        defaultValues: {
            firstname: usuario?.firstname ?? '',
            lastname: usuario?.lastname ?? '',
            email: usuario?.email ?? '',
            role: usuario?.role ?? 'ADMIN',
        },
    })

    async function onSubmit(values: UsuarioFormValues) {
        setSubmitError(null)
        const payload = {
            ...values,
            firstname: values.firstname.trim(),
            lastname: values.lastname.trim(),
            email: values.email.trim(),
        }
        try {
            if (usuario) await usuariosApi.update(usuario.id, payload)
            else await usuariosApi.create(payload)
            onSaved(!usuario)
        } catch (err) {
            const fieldErrors = getFieldErrors(err)
            if (fieldErrors) {
                for (const [field, message] of Object.entries(fieldErrors)) {
                    if (field in payload) setError(field as keyof UsuarioFormValues, {message})
                }
            }
            setSubmitError(getErrorMessage(err))
        }
    }

    // handleSubmit is passed straight to the form; the wrapper keeps the FormEvent type explicit.
    const submit = (event: FormEvent<HTMLFormElement>) => void handleSubmit(onSubmit)(event)

    return (
        <Modal title={usuario ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => !isSubmitting && onClose()}>
            <form onSubmit={submit} className="space-y-4" noValidate>
                {submitError && <Alert variant="error">{submitError}</Alert>}
                {!usuario && (
                    <Alert variant="info">
                        No se solicita contraseña: el sistema genera una provisoria y la envía al correo indicado. La
                        persona deberá cambiarla en su primer ingreso.
                    </Alert>
                )}

                <FormField label="Nombre" htmlFor="firstname" required error={errors.firstname?.message}>
                    <Input
                        id="firstname"
                        hasError={!!errors.firstname}
                        {...register('firstname', {validate: (v) => v.trim().length > 0 || 'Ingrese el nombre'})}
                    />
                </FormField>
                <FormField label="Apellido" htmlFor="lastname" required error={errors.lastname?.message}>
                    <Input
                        id="lastname"
                        hasError={!!errors.lastname}
                        {...register('lastname', {validate: (v) => v.trim().length > 0 || 'Ingrese el apellido'})}
                    />
                </FormField>
                <FormField label="Email" htmlFor="user-email" required error={errors.email?.message}>
                    <Input
                        id="user-email"
                        type="email"
                        hasError={!!errors.email}
                        {...register('email', {
                            required: 'Ingrese el email',
                            pattern: {value: EMAIL_PATTERN, message: 'Ingrese un email válido'},
                        })}
                    />
                </FormField>
                <FormField label="Rol" htmlFor="role" required error={errors.role?.message}>
                    <Select id="role" {...register('role', {required: 'Seleccione el rol'})}>
                        <option value="ADMIN">{roleLabels.ADMIN}</option>
                        <option value="SUPERADMIN">{roleLabels.SUPERADMIN}</option>
                    </Select>
                </FormField>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                        {usuario ? 'Guardar' : 'Crear usuario'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
