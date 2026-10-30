const BACKUP_CREATED_EVENT = 'digesto:backup-created'

export function notifyBackupCreated(): void {
    window.dispatchEvent(new Event(BACKUP_CREATED_EVENT))
}

export function onBackupCreated(listener: () => void): () => void {
    window.addEventListener(BACKUP_CREATED_EVENT, listener)
    return () => window.removeEventListener(BACKUP_CREATED_EVENT, listener)
}
