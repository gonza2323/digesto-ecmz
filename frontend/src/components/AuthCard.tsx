import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'

interface AuthCardProps {
    title: string
    subtitle?: string
    children: ReactNode
}

export function AuthCard({title, subtitle, children}: AuthCardProps) {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <header className="bg-institutional border-b border-institutional-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <Link to="/" className="text-lg sm:text-2xl font-semibold text-white font-display">
                        Digesto Escuela
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white border border-neutral-200 rounded-lg p-5 sm:p-8">
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">{title}</h1>
                    {subtitle && <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">{subtitle}</p>}
                    {!subtitle && <div className="mb-5"/>}
                    {children}
                </div>
            </main>
        </div>
    )
}
