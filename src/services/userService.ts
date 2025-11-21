import api from './api'
import type { UserAPI, UserRegistration, UserUpdate, ChangePassword, UserSession, PaginatedResponse } from '@/types'

export interface UserQueryParams {
  search?: string
  ordering?: string
  page?: number
  role?: string
  is_active?: boolean
}

export const userService = {
  /**
   * Registra um novo usuário (endpoint público)
   */
  async register(data: UserRegistration): Promise<UserAPI> {
    const response = await api.post<UserAPI>('/users/register/', data)
    return response.data
  },

  /**
   * Lista todos os usuários (somente admin)
   */
  async list(params?: UserQueryParams): Promise<PaginatedResponse<UserAPI>> {
    const response = await api.get<PaginatedResponse<UserAPI>>('/users/', { params })
    return response.data
  },

  /**
   * Busca um usuário específico por ID
   */
  async getById(id: number): Promise<UserAPI> {
    const response = await api.get<UserAPI>(`/users/${id}/`)
    return response.data
  },

  /**
   * Obtém o perfil do usuário autenticado
   */
  async getMe(): Promise<UserAPI> {
    const response = await api.get<UserAPI>('/users/me/')
    return response.data
  },

  /**
   * Atualiza o perfil do usuário autenticado
   */
  async updateMe(data: UserUpdate): Promise<UserAPI> {
    const response = await api.patch<UserAPI>('/users/me/', data)
    return response.data
  },

  /**
   * Altera a senha do usuário autenticado
   */
  async changePassword(data: ChangePassword): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/users/change_password/', data)
    return response.data
  },

  /**
   * Lista todas as sessões ativas do usuário
   */
  async listSessions(): Promise<PaginatedResponse<UserSession>> {
    const response = await api.get<PaginatedResponse<UserSession>>('/sessions/')
    return response.data
  },

  /**
   * Deleta uma sessão específica (faz logout em um dispositivo específico)
   */
  async deleteSession(sessionId: number): Promise<void> {
    await api.delete(`/users/sessions/${sessionId}/`)
  },

  /**
   * Cria um novo usuário - somente admin
   * Usado para criar managers e outros usuários
   */
  async create(user: { email: string; username: string; password: string; password_confirm: string; first_name?: string; last_name?: string; phone?: string; role?: string }): Promise<UserAPI> {
    const response = await api.post<UserAPI>('/users/', user)
    return response.data
  },

  /**
   * Atualiza um usuário completamente (PUT) - somente admin
   */
  async update(id: number, user: Omit<UserAPI, 'id' | 'created_at' | 'updated_at' | 'date_joined'>): Promise<UserAPI> {
    const response = await api.put<UserAPI>(`/users/${id}/`, user)
    return response.data
  },

  /**
   * Atualiza um usuário parcialmente (PATCH) - somente admin
   */
  async partialUpdate(id: number, user: Partial<UserAPI>): Promise<UserAPI> {
    const response = await api.patch<UserAPI>(`/users/${id}/`, user)
    return response.data
  },

  /**
   * Deleta um usuário - somente admin
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}/`)
  }
}
