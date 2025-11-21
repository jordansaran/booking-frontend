import api from './api'
import type { ResourceAPI, PaginatedResponse } from '@/types'

export interface ResourceQueryParams {
  search?: string
  ordering?: string
  page?: number
}

export const resourceService = {
  /**
   * Lista todos os recursos com paginação e filtros
   */
  async list(params?: ResourceQueryParams): Promise<PaginatedResponse<ResourceAPI>> {
    const response = await api.get<PaginatedResponse<ResourceAPI>>('/resource/', { params })
    return response.data
  },

  /**
   * Busca um recurso específico por ID
   */
  async getById(id: number): Promise<ResourceAPI> {
    const response = await api.get<ResourceAPI>(`/resource/${id}/`)
    return response.data
  },

  /**
   * Cria um novo recurso
   */
  async create(resource: Omit<ResourceAPI, 'id' | 'created_at' | 'updated_at'>): Promise<ResourceAPI> {
    const response = await api.post<ResourceAPI>('/resource/', resource)
    return response.data
  },

  /**
   * Atualiza um recurso completamente (PUT)
   */
  async update(id: number, resource: Omit<ResourceAPI, 'id' | 'created_at' | 'updated_at'>): Promise<ResourceAPI> {
    const response = await api.put<ResourceAPI>(`/resource/${id}/`, resource)
    return response.data
  },

  /**
   * Atualiza um recurso parcialmente (PATCH)
   */
  async partialUpdate(id: number, resource: Partial<ResourceAPI>): Promise<ResourceAPI> {
    const response = await api.patch<ResourceAPI>(`/resource/${id}/`, resource)
    return response.data
  },

  /**
   * Deleta um recurso
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/resource/${id}/`)
  }
}
