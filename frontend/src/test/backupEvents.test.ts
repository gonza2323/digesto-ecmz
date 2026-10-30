import {describe, expect, it, vi} from 'vitest'
import {notifyBackupCreated, onBackupCreated} from '@/utils/backupEvents'

describe('backupEvents', () => {
    it('notifica a los suscriptores hasta que se desuscriben', () => {
        const listener = vi.fn()
        const unsubscribe = onBackupCreated(listener)

        notifyBackupCreated()
        expect(listener).toHaveBeenCalledTimes(1)

        unsubscribe()
        notifyBackupCreated()
        expect(listener).toHaveBeenCalledTimes(1)
    })
})
