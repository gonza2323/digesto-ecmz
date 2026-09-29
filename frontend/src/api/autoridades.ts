import {http} from '@/api/http'
import type {Autoridad} from '@/types/catalog'

export const autoridadesApi = {
    async list(): Promise<Autoridad[]> {
        const {data} = await http.get<Autoridad[]>('/api/autoridades')
        return data
    },

    async create(name: string): Promise<Autoridad> {
        const {data} = await http.post<Autoridad>('/api/autoridades', {name})
        return data
    },

    async update(id: string, name: string): Promise<Autoridad> {
        const {data} = await http.put<Autoridad>(`/api/autoridades/${id}`, {id, name})
        return data
    },

    async remove(id: string): Promise<void> {
        await http.delete(`/api/autoridades/${id}`)
    },
}
