/** BackupStatusDto */
export interface BackupStatus {
    ultimoBackup: string | null // Instant, ISO-8601
    alerta: boolean
    mesesDeAlerta: number
}

/** PlantillaCorreoDto */
export interface PlantillaCorreo {
    asunto: string
    cuerpo: string
}
