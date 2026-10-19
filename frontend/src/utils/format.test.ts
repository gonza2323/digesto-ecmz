import {describe, expect, it} from 'vitest'
import {formatDateLong, formatFileSize} from '@/utils/format'

describe('formatDateLong', () => {
    it('does not shift the day for LocalDate strings (no UTC off-by-one)', () => {
        expect(formatDateLong('2026-04-09')).toBe('9 de abril de 2026')
        expect(formatDateLong('2026-01-01')).toBe('1 de enero de 2026')
    })

    it('shows a dash for missing dates', () => {
        expect(formatDateLong(null)).toBe('—')
    })
})

describe('formatFileSize', () => {
    it('formats bytes, KB and MB', () => {
        expect(formatFileSize(512)).toBe('512 B')
        expect(formatFileSize(956 * 1024)).toBe('956 KB')
        expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2.4 MB')
    })
})
