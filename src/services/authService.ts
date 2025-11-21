import api from './api'
import type { LoginRequest, TokenResponse, TokenRefreshRequest, TokenRefreshResponse, User, UserRole } from '@/types'

/**
 * Decodifica um JWT token (sem validação - apenas parsing)
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export const authService = {
  /**
   * Realiza login e obtém tokens JWT
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/token/', credentials)

    // Salvar tokens no localStorage
    localStorage.setItem('access_token', response.data.access)
    localStorage.setItem('refresh_token', response.data.refresh)

    // Priorizar dados do usuário vindos da resposta, ou extrair do token
    if (response.data.user) {
      // Usar dados do usuário da resposta
      localStorage.setItem('user_id', response.data.user.id.toString())
      localStorage.setItem('user_username', response.data.user.username)
      localStorage.setItem('user_email', response.data.user.email)
      localStorage.setItem('user_role', response.data.user.role || 'user')
      if (response.data.user.first_name) {
        localStorage.setItem('user_first_name', response.data.user.first_name)
      }
      if (response.data.user.last_name) {
        localStorage.setItem('user_last_name', response.data.user.last_name)
      }
    } else {
      // Fallback: extrair dados do token JWT
      const userData = decodeJWT(response.data.access)
      if (userData) {
        localStorage.setItem('user_id', userData.user_id?.toString() || userData.id?.toString() || '')
        localStorage.setItem('user_username', userData.username || '')
        localStorage.setItem('user_email', userData.email || credentials.email)
        localStorage.setItem('user_role', userData.role || 'user')
      }
    }

    return response.data
  },

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await api.post<TokenRefreshResponse>('/token/refresh/', {
      refresh: refreshToken
    } as TokenRefreshRequest)

    // Atualizar access token no localStorage
    localStorage.setItem('access_token', response.data.access)

    // Atualizar dados do usuário do novo token
    const userData = decodeJWT(response.data.access)
    if (userData) {
      localStorage.setItem('user_id', userData.user_id?.toString() || userData.id?.toString() || '')
      localStorage.setItem('user_email', userData.email || '')
      localStorage.setItem('user_role', userData.role || 'user')
    }

    return response.data
  },

  /**
   * Verifica se um token é válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await api.post('/token/verify/', { token })
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Realiza logout no servidor (sessão atual) e remove tokens locais
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await api.post('/logout/', {
          refresh: refreshToken
        })
      }
    } catch (error) {
      // Mesmo se der erro no servidor, limpar dados locais
      console.error('Erro ao fazer logout no servidor:', error)
    } finally {
      this.clearLocalData()
    }
  },

  /**
   * Realiza logout de todas as sessões e remove tokens locais
   */
  async logoutFromAllDevices(): Promise<void> {
    try {
      await api.post('/logout-all/')
    } catch (error) {
      console.error('Erro ao fazer logout de todos os dispositivos:', error)
      throw error
    } finally {
      this.clearLocalData()
    }
  },

  /**
   * Limpa dados de autenticação do localStorage
   */
  clearLocalData(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_username')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_first_name')
    localStorage.removeItem('user_last_name')
    localStorage.removeItem('userRole') // Compatibilidade com código antigo
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    if (!token) return false

    // Verificar se o token está expirado
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return false

    const now = Date.now() / 1000
    return decoded.exp > now
  },

  /**
   * Obtém o access token atual
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },

  /**
   * Obtém o refresh token atual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  },

  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser(): User | null {
    const userId = localStorage.getItem('user_id')
    const username = localStorage.getItem('user_username')
    const email = localStorage.getItem('user_email')
    const role = localStorage.getItem('user_role') as UserRole
    const firstName = localStorage.getItem('user_first_name')
    const lastName = localStorage.getItem('user_last_name')

    if (!userId || !username || !email) return null

    return {
      id: parseInt(userId),
      username,
      email,
      role: role || 'user',
      first_name: firstName || undefined,
      last_name: lastName || undefined
    }
  },

  /**
   * Obtém o role do usuário atual
   */
  getUserRole(): UserRole {
    return (localStorage.getItem('user_role') as UserRole) || 'user'
  },

  /**
   * Verifica se o usuário tem um role específico
   */
  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role
  },

  /**
   * Verifica se o usuário tem permissão de admin ou manager
   */
  isAdminOrManager(): boolean {
    const role = this.getUserRole()
    return role === 'admin' || role === 'manager'
  }
}
