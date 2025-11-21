import api from './api'
import type { BookingAPI, BookingListAPI, PaginatedResponse } from '@/types'

export interface BookingQueryParams {
  room?: string | number
  date_booking?: string
  manager?: string | number
  ordering?: string
  page?: number
}

export const bookingService = {
  /**
   * Lista todas as reservas com paginação e filtros
   */
  async list(params?: BookingQueryParams): Promise<PaginatedResponse<BookingAPI>> {
    const response = await api.get<PaginatedResponse<BookingAPI>>('/booking/', { params })
    return response.data
  },

  /**
   * Verifica disponibilidade de salas
   */
  async checkAvailability(params?: BookingQueryParams): Promise<PaginatedResponse<BookingAPI>> {
    const response = await api.get<PaginatedResponse<BookingAPI>>('/booking/availability/', { params })
    return response.data
  },

  /**
   * Lista reservas pendentes
   */
  async listPending(params?: BookingQueryParams): Promise<PaginatedResponse<BookingAPI>> {
    const response = await api.get<PaginatedResponse<BookingAPI>>('/booking/pending/', { params })
    return response.data
  },

  /**
   * Busca uma reserva específica por ID
   */
  async getById(id: number): Promise<BookingAPI> {
    const response = await api.get<BookingAPI>(`/booking/${id}/`)
    return response.data
  },

  /**
   * Cria uma nova reserva
   */
  async create(booking: Omit<BookingAPI, 'id' | 'created_at' | 'updated_at'>): Promise<BookingAPI> {
    const response = await api.post<BookingAPI>('/booking/', booking)
    return response.data
  },

  /**
   * Atualiza uma reserva completamente (PUT)
   */
  async update(id: number, booking: Omit<BookingAPI, 'id' | 'created_at' | 'updated_at'>): Promise<BookingAPI> {
    const response = await api.put<BookingAPI>(`/booking/${id}/`, booking)
    return response.data
  },

  /**
   * Atualiza uma reserva parcialmente (PATCH)
   */
  async partialUpdate(id: number, booking: Partial<BookingAPI>): Promise<BookingAPI> {
    const response = await api.patch<BookingAPI>(`/booking/${id}/`, booking)
    return response.data
  },

  /**
   * Cancela uma reserva
   */
  async cancel(id: number, cancellation_reason?: string): Promise<BookingAPI> {
    const response = await api.post<BookingAPI>(`/booking/${id}/cancel/`, {
      cancellation_reason
    })
    return response.data
  },

  /**
   * Confirma uma reserva
   */
  async confirm(id: number): Promise<BookingAPI> {
    const response = await api.post<BookingAPI>(`/booking/${id}/confirm/`, {})
    return response.data
  },

  /**
   * Deleta uma reserva permanentemente
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/booking/${id}/`)
  }
}
