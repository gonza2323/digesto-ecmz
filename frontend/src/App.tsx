import {Link, Navigate, Route, Routes} from 'react-router-dom'
import {ProtectedRoute} from '@/components/ProtectedRoute'
import {RoleRoute} from '@/components/RoleRoute'
import {ToastContainer} from '@/components/ToastContainer'
import {AdminLayout} from '@/layouts/AdminLayout'
import {PublicLayout} from '@/layouts/PublicLayout'
import {AutoridadesPage} from '@/pages/admin/AutoridadesPage'
import {BackupsPage} from '@/pages/admin/BackupsPage'
import {ChangePasswordPage} from '@/pages/admin/ChangePasswordPage'
import {NormativaAdminDetailPage} from '@/pages/admin/NormativaAdminDetailPage'
import {NormativaFormPage} from '@/pages/admin/NormativaFormPage'
import {NormativasListPage} from '@/pages/admin/NormativasListPage'
import {PlantillaCorreoPage} from '@/pages/admin/PlantillaCorreoPage'
import {TiposDocumentoPage} from '@/pages/admin/TiposDocumentoPage'
import {UsuariosPage} from '@/pages/admin/UsuariosPage'
import {ForgotPasswordPage} from '@/pages/auth/ForgotPasswordPage'
import {LoginPage} from '@/pages/auth/LoginPage'
import {ResetPasswordPage} from '@/pages/auth/ResetPasswordPage'
import {HomePage} from '@/pages/public/HomePage'
import {NormativaDetailPage} from '@/pages/public/NormativaDetailPage'

function NotFoundPage() {
    return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Página no encontrada</h1>
            <p className="text-neutral-600 mb-6">La dirección que buscó no existe.</p>
            <Link to="/" className="text-institutional hover:underline">
                Volver al inicio
            </Link>
        </div>
    )
}

export default function App() {
    return (
        <>
            <Routes>
                {/* Sitio público */}
                <Route element={<PublicLayout/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="normativas/:id" element={<NormativaDetailPage/>}/>
                </Route>

                {/* Autenticación */}
                <Route path="login" element={<LoginPage/>}/>
                <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
                <Route path="reset-password" element={<ResetPasswordPage/>}/>

                {/* Panel administrativo */}
                <Route
                    path="admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout/>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="normativas" replace/>}/>
                    <Route path="normativas" element={<NormativasListPage/>}/>
                    <Route path="normativas/nueva" element={<NormativaFormPage/>}/>
                    <Route
                        path="normativas/pendientes"
                        element={
                            <RoleRoute role="SUPERADMIN">
                                <NormativasListPage pendientesOnly/>
                            </RoleRoute>
                        }
                    />
                    <Route path="normativas/:id" element={<NormativaAdminDetailPage/>}/>
                    <Route path="normativas/:id/editar" element={<NormativaFormPage/>}/>
                    <Route path="tipos-documento" element={<TiposDocumentoPage/>}/>
                    <Route path="autoridades" element={<AutoridadesPage/>}/>
                    <Route
                        path="usuarios"
                        element={
                            <RoleRoute role="SUPERADMIN">
                                <UsuariosPage/>
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="backups"
                        element={
                            <RoleRoute role="SUPERADMIN">
                                <BackupsPage/>
                            </RoleRoute>
                        }
                    />
                    <Route path="configuracion/correo" element={<PlantillaCorreoPage/>}/>
                    <Route path="cambiar-password" element={<ChangePasswordPage/>}/>
                </Route>

                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
            <ToastContainer/>
        </>
    )
}
