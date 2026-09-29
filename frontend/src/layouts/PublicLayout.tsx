import {Outlet} from 'react-router-dom'
import {PublicHeader} from '@/components/PublicHeader'

export function PublicLayout() {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <PublicHeader/>
            <main className="flex-1">
                <Outlet/>
            </main>
            <footer className="border-t border-neutral-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-xs text-neutral-500">
                    Digesto Escuela — Escuela de Comercio Martín Zapata, Universidad Nacional de Cuyo.
                </div>
            </footer>
        </div>
    )
}
