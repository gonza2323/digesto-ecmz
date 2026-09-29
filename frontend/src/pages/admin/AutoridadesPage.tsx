import {autoridadesApi} from '@/api/autoridades'
import {CatalogPage} from '@/pages/admin/CatalogPage'

export function AutoridadesPage() {
    return (
        <CatalogPage
            title="Autoridades"
            description="Los nombres no pueden repetirse (sin distinguir mayúsculas). No se pueden eliminar si hay normativas que las usan."
            noun="autoridad"
            plural="autoridades"
            article="la"
            api={autoridadesApi}
        />
    )
}
