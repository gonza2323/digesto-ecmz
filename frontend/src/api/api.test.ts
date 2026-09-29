import {type AxiosAdapter, AxiosError, type InternalAxiosRequestConfig} from 'axios'
import {afterEach, describe, expect, it} from 'vitest'
import {ApiError, http} from '@/api/http'
import {normativasApi} from '@/api/normativas'
import type {NormativaFormValues} from '@/types/normativa'

const originalAdapter = http.defaults.adapter
afterEach(() => {
    http.defaults.adapter = originalAdapter
})

function failWith(status: number, data: unknown): AxiosAdapter {
    return (config: InternalAxiosRequestConfig) =>
        Promise.reject(
            new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, {
                status,
                statusText: '',
                headers: {},
                config,
                data,
            }),
        )
}

describe('http error normalization', () => {
    it('surfaces the backend message and field errors on 400', async () => {
        http.defaults.adapter = failWith(400, {
            message: 'Revise los campos del formulario',
            errors: {title: 'Ingrese el título'},
        })
        const error = await http.get('/x').catch((e: unknown) => e)
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(400)
        expect((error as ApiError).message).toBe('Revise los campos del formulario')
        expect((error as ApiError).fieldErrors).toEqual({title: 'Ingrese el título'})
    })

    it('reads the real message out of a Blob error body (backup download)', async () => {
        const body = new Blob([JSON.stringify({message: 'No se pudo generar el backup'})], {
            type: 'application/json',
        })
        http.defaults.adapter = failWith(400, body)
        const error = await http.get('/x', {responseType: 'blob'}).catch((e: unknown) => e)
        expect((error as ApiError).message).toBe('No se pudo generar el backup')
    })

    it('falls back to a status-specific message when the body has none', async () => {
        http.defaults.adapter = failWith(403, undefined)
        const error = await http.get('/x').catch((e: unknown) => e)
        expect((error as ApiError).status).toBe(403)
        expect((error as ApiError).message).toMatch(/permisos/)
    })
})

const values: NormativaFormValues = {
    number: 145,
    title: 'Resolución 145',
    description: 'Descripción',
    releaseDate: '2026-04-09',
    autoridadId: 'a1',
    tipoDocumentoId: 't1',
    recordNumber: 10,
    recordTitle: 'Expediente',
    notificaciones: ['a@b.com'],
    enviarAAprobacion: true,
}

/** Captures the request body instead of hitting the network. */
function captureBody(): { get: () => FormData } {
    let captured: FormData | undefined
    http.defaults.adapter = (config: InternalAxiosRequestConfig) => {
        captured = config.data as FormData
        return Promise.resolve({status: 200, statusText: 'OK', headers: {}, config, data: {id: 'n1'}})
    }
    return {get: () => captured as FormData}
}

describe('normativa multipart body', () => {
    it('sends the DTO as an application/json part named "normativa" plus the PDF as "archivo"', async () => {
        const capture = captureBody()
        const pdf = new File(['%PDF-1.4'], 'doc.pdf', {type: 'application/pdf'})

        await normativasApi.create(values, pdf)

        const form = capture.get()
        const jsonPart = form.get('normativa') as File
        expect(jsonPart.type).toBe('application/json')
        expect(JSON.parse(await jsonPart.text())).toEqual(values)
        expect((form.get('archivo') as File).name).toBe('doc.pdf')
    })

    it('omits the "archivo" part on update when the PDF is not replaced', async () => {
        const capture = captureBody()

        await normativasApi.update('n1', values, null)

        const form = capture.get()
        expect(form.has('normativa')).toBe(true)
        expect(form.has('archivo')).toBe(false)
    })
})

describe('normativa file urls', () => {
    it('builds inline and download URLs for public and admin endpoints', () => {
        expect(normativasApi.archivoUrl('n1')).toMatch(/\/api\/normativas\/n1\/archivo\?download=false$/)
        expect(normativasApi.archivoUrl('n1', true)).toMatch(/download=true$/)
        expect(normativasApi.archivoUrlAdmin('n1')).toMatch(/\/api\/admin\/normativas\/n1\/archivo/)
    })
})
