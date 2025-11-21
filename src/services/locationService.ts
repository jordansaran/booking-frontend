import api from './api'
import type { LocationAPI, PaginatedResponse } from '@/types'

export interface LocationQueryParams {
  search?: string
  ordering?: string
  page?: number
}

export const locationService = {
  /**
   * Lista todas as localizações com paginação e filtros
   */
  async list(params?: LocationQueryParams): Promise<PaginatedResponse<LocationAPI>> {
    const response = await api.get<PaginatedResponse<LocationAPI>>('/location/', { params })
    return response.data
  },

  /**
   * Busca uma localização específica por ID
   */
  async getById(id: number): Promise<LocationAPI> {
    const response = await api.get<LocationAPI>(`/location/${id}/`)
    return response.data
  },

  /**
   * Cria uma nova localização
   */
  async create(location: Omit<LocationAPI, 'id' | 'created_at' | 'updated_at'>): Promise<LocationAPI> {
    const response = await api.post<LocationAPI>('/location/', location)
    return response.data
  },

  /**
   * Atualiza uma localização completamente (PUT)
   */
  async update(id: number, location: Omit<LocationAPI, 'id' | 'created_at' | 'updated_at'>): Promise<LocationAPI> {
    const response = await api.put<LocationAPI>(`/location/${id}/`, location)
    return response.data
  },

  /**
   * Atualiza uma localização parcialmente (PATCH)
   */
  async partialUpdate(id: number, location: Partial<LocationAPI>): Promise<LocationAPI> {
    const response = await api.patch<LocationAPI>(`/location/${id}/`, location)
    return response.data
  },

  /**
   * Deleta uma localização
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/location/${id}/`)
  }
}
