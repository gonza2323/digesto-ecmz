import {downloadBlob, filenameFromContentDisposition, http} from '@/api/http'
import type {BackupStatus} from '@/types/backup'

export const backupsApi = {
    async estado(): Promise<BackupStatus> {
        const {data} = await http.get<BackupStatus>('/api/admin/backups/estado')
        return data
    },

    /** Downloads the backup ZIP straight to the browser's downloads. */
    async crearYDescargar(): Promise<void> {
        const response = await http.get('/api/admin/backups', {responseType: 'blob'})
        const filename = filenameFromContentDisposition(
            response.headers['content-disposition'],
            `digesto-backup-${new Date().toISOString().slice(0, 10)}.zip`,
        )
        downloadBlob(response.data as Blob, filename)
    },

    async restaurar(archivo: File, password: string): Promise<void> {
        const formData = new FormData()
        formData.append('archivo', archivo)
        formData.append('password', password)
        await http.post('/api/admin/backups/restaurar', formData)
    },
}
