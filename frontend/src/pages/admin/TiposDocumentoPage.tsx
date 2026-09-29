import {tiposDocumentoApi} from '@/api/tiposDocumento'
import {CatalogPage} from '@/pages/admin/CatalogPage'

export function TiposDocumentoPage() {
    return (
        <CatalogPage
            title="Tipos de normativa"
            description="Los nombres no pueden repetirse (sin distinguir mayúsculas). No se pueden eliminar si hay normativas que los usan."
            noun="tipo de normativa"
            plural="tipos de normativa"
            article="el"
            api={tiposDocumentoApi}
        />
    )
}
