import api from './api'
import type { RoomAPI, PaginatedResponse } from '@/types'

export interface RoomQueryParams {
  search?: string
  ordering?: string
  page?: number
}

export const roomService = {
  /**
   * Lista todas as salas com paginação e filtros
   */
  async list(params?: RoomQueryParams): Promise<PaginatedResponse<RoomAPI>> {
    const response = await api.get<PaginatedResponse<RoomAPI>>('/room/', { params })
    return response.data
  },

  /**
   * Busca uma sala específica por ID
   */
  async getById(id: number): Promise<RoomAPI> {
    const response = await api.get<RoomAPI>(`/room/${id}/`)
    return response.data
  },

  /**
   * Cria uma nova sala
   */
  async create(room: Omit<RoomAPI, 'id' | 'created_at' | 'updated_at' | 'all_bookings'>): Promise<RoomAPI> {
    const response = await api.post<RoomAPI>('/room/', room)
    return response.data
  },

  /**
   * Atualiza uma sala completamente (PUT)
   */
  async update(id: number, room: Omit<RoomAPI, 'id' | 'created_at' | 'updated_at' | 'all_bookings'>): Promise<RoomAPI> {
    const response = await api.put<RoomAPI>(`/room/${id}/`, room)
    return response.data
  },

  /**
   * Atualiza uma sala parcialmente (PATCH)
   */
  async partialUpdate(id: number, room: Partial<RoomAPI>): Promise<RoomAPI> {
    const response = await api.patch<RoomAPI>(`/room/${id}/`, room)
    return response.data
  },

  /**
   * Deleta uma sala
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/room/${id}/`)
  }
}
