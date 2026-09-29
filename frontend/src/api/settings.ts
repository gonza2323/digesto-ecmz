import {http} from '@/api/http'
import type {PlantillaCorreo} from '@/types/backup'

export const settingsApi = {
    async getPlantillaCorreo(): Promise<PlantillaCorreo> {
        const {data} = await http.get<PlantillaCorreo>('/api/admin/plantilla-correo')
        return data
    },

    async updatePlantillaCorreo(payload: PlantillaCorreo): Promise<PlantillaCorreo> {
        const {data} = await http.put<PlantillaCorreo>('/api/admin/plantilla-correo', payload)
        return data
    },
}
