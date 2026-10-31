import type {ReactNode} from 'react'
import {SchoolBrand} from '@/components/SchoolBrand'
import {Link} from 'react-router-dom'

interface AuthCardProps {
    title: string
    subtitle?: string
    children: ReactNode
}

export function AuthCard({title, subtitle, children}: AuthCardProps) {
    return (
        <div className="min-h-screen bg-surface flex flex-col">
            <header className="bg-institutional-nav border-b border-white/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">

                    <Link
                        to="/"
                        className="inline-flex rounded-lg"
                        aria-label="Volver al inicio"
                    >
                        <SchoolBrand inverted compact/>
                    </Link>

                </div>
            </header>
            <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8">
                <div
                    className="
                        w-full max-w-md
                        rounded-2xl
                        border border-site-border
                        bg-white
                        p-6 sm:p-8
                        shadow-sm">
                    <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">{title}</h1>
                    {subtitle && <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5">{subtitle}</p>}
                    {!subtitle && <div className="mb-5"/>}
                    {children}
                </div>
            </main>
        </div>
    )
}
