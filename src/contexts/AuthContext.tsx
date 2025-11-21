import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services'
import type { User, UserRole, LoginRequest } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: UserRole) => boolean
  isAdminOrManager: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        authService.clearLocalData()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const isAdminOrManager = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        isAdminOrManager
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
