import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Aguarda carregamento do estado de autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se tem roles permitidos, verifica se o usuário tem permissão
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = user && allowedRoles.includes(user.role)

    if (!hasPermission) {
      // Redireciona para página inicial ou acesso negado
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
