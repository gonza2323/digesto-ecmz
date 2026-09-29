import {http} from '@/api/http'
import type {TipoDocumento} from '@/types/catalog'

export const tiposDocumentoApi = {
    async list(): Promise<TipoDocumento[]> {
        const {data} = await http.get<TipoDocumento[]>('/api/tipos-documento')
        return data
    },

    async create(name: string): Promise<TipoDocumento> {
        const {data} = await http.post<TipoDocumento>('/api/tipos-documento', {name})
        return data
    },

    async update(id: string, name: string): Promise<TipoDocumento> {
        const {data} = await http.put<TipoDocumento>(`/api/tipos-documento/${id}`, {id, name})
        return data
    },

    async remove(id: string): Promise<void> {
        await http.delete(`/api/tipos-documento/${id}`)
    },
}
