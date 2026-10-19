import {Pencil, Plus, Trash2} from 'lucide-react'
import {type FormEvent, useState} from 'react'
import {Alert} from '@/components/ui/Alert'
import {Button} from '@/components/ui/Button'
import {ConfirmDialog} from '@/components/ui/ConfirmDialog'
import {FormField} from '@/components/ui/FormField'
import {Input} from '@/components/ui/Input'
import {Modal} from '@/components/ui/Modal'
import {EmptyState, ErrorState, LoadingState} from '@/components/ui/States'
import {useAsyncData} from '@/hooks/useAsyncData'
import {useToast} from '@/hooks/useToast'
import {getErrorMessage} from '@/utils/errors'

interface CatalogItem {
    id: string
    name: string
}

interface CatalogApi {
    list: () => Promise<CatalogItem[]>
    create: (name: string) => Promise<CatalogItem>
    update: (id: string, name: string) => Promise<CatalogItem>
    remove: (id: string) => Promise<void>
}

interface CatalogPageProps {
    title: string
    description: string
    /** Singular noun, lowercase, used in messages (e.g. "tipo de normativa"). */
    noun: string
    /** Plural form used in the empty state (e.g. "tipos de normativa"). */
    plural: string
    /** Grammatical article for the noun ("el" / "la"). */
    article: 'el' | 'la'
    api: CatalogApi
}

export function CatalogPage({title, description, noun, plural, article, api}: CatalogPageProps) {
    const {showToast} = useToast()
    const {data, loading, error, reload} = useAsyncData(() => api.list(), [])

    // `editing === null` closed; `'new'` creating; otherwise the item being edited.
    const [editing, setEditing] = useState<CatalogItem | 'new' | null>(null)
    const [name, setName] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<CatalogItem | null>(null)

    function openNew() {
        setName('')
        setFormError(null)
        setEditing('new')
    }

    function openEdit(item: CatalogItem) {
        setName(item.name)
        setFormError(null)
        setEditing(item)
    }

    async function handleSave(event: FormEvent) {
        event.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
            setFormError('Ingrese el nombre')
            return
        }
        setSaving(true)
        setFormError(null)
        try {
            if (editing === 'new') await api.create(trimmed)
            else if (editing) await api.update(editing.id, trimmed)
            showToast('success', editing === 'new' ? 'Se creó correctamente.' : 'Se guardaron los cambios.')
            setEditing(null)
            reload()
        } catch (err) {
            setFormError(getErrorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(item: CatalogItem) {
        try {
            await api.remove(item.id)
            showToast('success', 'Se eliminó correctamente.')
            setDeleting(null)
            reload()
        } catch (err) {
            // e.g. "No se puede eliminar: hay normativas que usan ..." comes straight from the backend.
            setDeleting(null)
            showToast('error', getErrorMessage(err))
        }
    }

    return (
        <div className="max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">{title}</h1>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">{description}</p>
                </div>
                <Button onClick={openNew}>
                    <Plus className="w-4 h-4" aria-hidden="true"/>
                    Nuevo
                </Button>
            </div>

            {loading && !data ? (
                <LoadingState/>
            ) : error ? (
                <ErrorState message={error} onRetry={reload}/>
            ) : data && data.length === 0 ? (
                <EmptyState title={`No hay ${plural} cargad${article === 'el' ? 'os' : 'as'}`}
                            description="Cree el primero con el botón «Nuevo»."/>
            ) : data ? (
                <ul className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                    {data.map((item) => (
                        <li key={item.id}
                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                            <span className="text-neutral-900 font-medium">{item.name}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    aria-label={`Editar ${item.name}`}
                                    className="p-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" aria-hidden="true"/>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleting(item)}
                                    aria-label={`Eliminar ${item.name}`}
                                    className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" aria-hidden="true"/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}

            {editing && (
                <Modal
                    title={editing === 'new' ? `Nuev${article === 'el' ? 'o' : 'a'} ${noun}` : `Editar ${noun}`}
                    onClose={() => !saving && setEditing(null)}
                >
                    <form onSubmit={handleSave} className="space-y-4" noValidate>
                        {formError && <Alert variant="error">{formError}</Alert>}
                        <FormField label="Nombre" htmlFor="catalog-name" required>
                            <Input
                                id="catalog-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                maxLength={255}
                                autoComplete="off"
                            />
                        </FormField>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setEditing(null)}
                                    disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={saving}>
                                Guardar
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleting && (
                <ConfirmDialog
                    title={`Eliminar ${noun}`}
                    description={
                        <>
                            ¿Seguro que desea eliminar {article} {noun} <strong>{deleting.name}</strong>? No se puede
                            eliminar si alguna normativa {article === 'el' ? 'lo' : 'la'} utiliza.
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
