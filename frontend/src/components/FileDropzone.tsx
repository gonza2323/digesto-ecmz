import {FileText, Upload} from 'lucide-react'
import {type ChangeEvent, useId} from 'react'
import {formatFileSize} from '@/utils/format'

interface FileDropzoneProps {
    file: File | null
    onChange: (file: File | null) => void
    /** Name/size of the PDF already stored on the server, shown while editing. */
    currentFile?: { name: string; size: number } | null
    error?: string
    required?: boolean
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // matches spring.servlet.multipart.max-file-size

export function FileDropzone({file, onChange, currentFile, error, required}: FileDropzoneProps) {
    const inputId = useId()

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0] ?? null
        onChange(selected)
    }

    const showingCurrent = !file && currentFile

    return (
        <div>
            <label htmlFor={inputId} className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                Documento {required && <span aria-hidden="true">*</span>}
                {required && <span className="sr-only">(obligatorio)</span>}
            </label>
            <input
                id={inputId}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleChange}
            />
            <label
                htmlFor={inputId}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full px-4 py-6 sm:py-8 border-2 border-dashed rounded-lg hover:border-institutional transition-colors cursor-pointer ${
                    error ? 'border-red-300' : 'border-neutral-300'
                }`}
            >
                {file ? (
                    <>
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-institutional" aria-hidden="true"/>
                        <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-neutral-700">{file.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">{formatFileSize(file.size)} — clic para
                                reemplazar</p>
                        </div>
                    </>
                ) : showingCurrent ? (
                    <>
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-institutional" aria-hidden="true"/>
                        <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-neutral-700">{currentFile.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                                {formatFileSize(currentFile.size)} — clic para reemplazar el PDF
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" aria-hidden="true"/>
                        <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-neutral-700">Click para subir archivo</p>
                            <p className="text-xs text-neutral-500 mt-1">PDF (máx. 50MB)</p>
                        </div>
                    </>
                )}
            </label>
            {file && file.size > MAX_SIZE_BYTES && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                    El archivo supera los 50MB permitidos.
                </p>
            )}
            {error && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}
