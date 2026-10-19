import {Calendar, FileText} from 'lucide-react'
import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Badge, EstadoBadge} from '@/components/ui/Badge'
import type {NormativaSummary} from '@/types/normativa'
import {formatDateLong, formatFileSize} from '@/utils/format'

interface NormativaResultsProps {
    items: NormativaSummary[]
    /** Base path used to link each title to its detail page. */
    detailPath: (id: string) => string
    renderActions: (item: NormativaSummary) => ReactNode
    showEstado?: boolean
}

export function NormativaResults({items, detailPath, renderActions, showEstado}: NormativaResultsProps) {
    return (
        <>
            {/* Desktop: table */}
            <div className="hidden md:block bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-institutional text-white">
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Título</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Tipo / N°</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Autoridad</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Tamaño</th>
                            {showEstado &&
                                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Estado</th>}
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50 transition-colors align-top">
                                <td className="px-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-institutional shrink-0 mt-0.5"
                                                  aria-hidden="true"/>
                                        <div className="min-w-0">
                                            <Link
                                                to={detailPath(item.id)}
                                                className="font-medium text-neutral-900 hover:text-institutional hover:underline"
                                            >
                                                {item.title}
                                            </Link>
                                            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-neutral-600 whitespace-nowrap">
                                    <Badge className="bg-neutral-100 text-neutral-700">{item.tipoDocumento}</Badge>
                                    <p className="mt-1">N° {item.number}</p>
                                </td>
                                <td className="px-4 py-4 text-sm text-neutral-600">{item.autoridad}</td>
                                <td className="px-4 py-4 text-sm text-neutral-600 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-neutral-400" aria-hidden="true"/>
                                        {formatDateLong(item.releaseDate)}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-neutral-600 whitespace-nowrap">
                                    {formatFileSize(item.archivoSize)}
                                </td>
                                {showEstado && (
                                    <td className="px-4 py-4">
                                        <EstadoBadge estado={item.estado}/>
                                    </td>
                                )}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 flex-wrap">{renderActions(item)}</div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden space-y-3">
                {items.map((item) => (
                    <li key={item.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                            <FileText className="w-5 h-5 text-institutional shrink-0 mt-0.5" aria-hidden="true"/>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-neutral-900 text-sm mb-1">
                                    <Link to={detailPath(item.id)} className="hover:text-institutional hover:underline">
                                        {item.title}
                                    </Link>
                                </h3>
                                <p className="text-xs text-neutral-500 mb-2 line-clamp-3">{item.description}</p>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge
                                        className="bg-neutral-100 text-neutral-700 !text-xs">{item.tipoDocumento}</Badge>
                                    <span className="text-xs text-neutral-500">N° {item.number}</span>
                                    <span className="text-xs text-neutral-500">{item.autoridad}</span>
                                    {showEstado && <EstadoBadge estado={item.estado}/>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" aria-hidden="true"/>
                      {formatDateLong(item.releaseDate)}
                  </span>
                                    <span>{formatFileSize(item.archivoSize)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">{renderActions(item)}</div>
                    </li>
                ))}
            </ul>
        </>
    )
}
