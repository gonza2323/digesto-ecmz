import {http} from '@/api/http'
import type {Usuario, UsuarioFormValues} from '@/types/auth'

export const usuariosApi = {
    async list(): Promise<Usuario[]> {
        const {data} = await http.get<Usuario[]>('/api/admin/usuarios')
        return data
    },

    async create(values: UsuarioFormValues): Promise<Usuario> {
        const {data} = await http.post<Usuario>('/api/admin/usuarios', values)
        return data
    },

    async update(id: string, values: UsuarioFormValues): Promise<Usuario> {
        const {data} = await http.put<Usuario>(`/api/admin/usuarios/${id}`, values)
        return data
    },

    async remove(id: string): Promise<void> {
        await http.delete(`/api/admin/usuarios/${id}`)
    },
}
