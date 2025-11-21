import { z } from 'zod'

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export type UserRole = 'admin' | 'manager' | 'user'

// ============================================
// TIPOS DA API (baseados no Swagger)
// ============================================

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access: string
  refresh: string
  user?: {
    id: number
    email: string
    first_name?: string
    last_name?: string
    role: UserRole
  }
}

export interface TokenRefreshRequest {
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
}

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: UserRole
}

// User Management
export interface UserAPI {
  id?: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: UserRole
  role_display?: string
  is_active?: boolean
  date_joined?: string
  created_at?: string
  updated_at?: string
}

export interface UserRegistration {
  email: string
  username: string
  first_name?: string
  last_name?: string
  phone?: string
  password: string
  password_confirm: string
}

export interface UserUpdate {
  first_name?: string
  last_name?: string
  phone?: string
}

export interface ChangePassword {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface UserSession {
  id?: number
  device_name?: string
  ip_address?: string
  location?: string
  is_current?: boolean
  is_active?: boolean
  device_type?: string
  created_at?: string
  last_activity?: string
  expires_at?: string
}

export interface TokenVerify {
  token: string
}

// Booking
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface BookingAPI {
  id?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
  date_booking: string // format: date (YYYY-MM-DD)
  start_datetime: string // format: date-time (ISO 8601)
  end_datetime: string // format: date-time (ISO 8601)
  duration_minutes?: number
  has_coffee_break?: boolean
  coffee_break_headcount?: number
  manager: number
  manager_name?: string
  manager_email?: string
  manager_phone?: string
  room: number
  room_name?: string
  room_capacity?: number
  room_resources?: string[]
  location?: string
  location_address?: string
  location_city?: string
  status?: BookingStatus
  status_display?: string
  confirmed_by?: number
  confirmed_by_name?: string
  confirmed_at?: string
  cancelled_by?: number
  cancelled_by_name?: string
  cancelled_at?: string
  cancellation_reason?: string
  notes?: string
}

export interface BookingListAPI {
  id?: number
  room_name?: string
  location?: string
  date_booking: string
  start_datetime: string
  end_datetime: string
  manager: number
  is_active?: boolean
}

// Resource
export interface ResourceAPI {
  id?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
  name: string
  description: string
}

// Room
export interface RoomAPI {
  id?: number
  all_bookings?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
  name: string
  capacity: number
  location: number
  resources?: number[]
}

// Location
export interface LocationAPI {
  id?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
  name: string
  address: string
  city: string
  state: string
  cep: string
  description?: string
}

// Pagination
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ============================================
// TIPOS DO FRONTEND (existentes)
// ============================================

export interface Localizacao {
  id: number
  nome: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  descricao?: string
  salasTotal?: number
  salasDisponiveis?: number
}

export interface Recurso {
  id: number
  nome: string
  tipo: 'Equipamento' | 'Material' | 'Sistema' | 'Infraestrutura'
  quantidade: number
  descricao: string
}

export interface Sala {
  id: number
  nome: string
  localizacao: string
  capacidade: number
  descricao?: string
  recursos: string[]
  disponivel: boolean
}

export type StatusReserva = 'confirmada' | 'pendente' | 'concluida' | 'cancelada'

export interface Reserva {
  id: number
  titulo: string
  sala: string
  localizacao: string
  data: string
  horaInicio: string
  horaFim: string
  participantes: number
  status: StatusReserva
  descricao?: string
  recursosAdicionais?: string[]
}

// ============================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================

// Schema de Login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema de Localização
export const localizacaoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  endereco: z
    .string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  cidade: z
    .string()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres'),
  cep: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 00000-000)'),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
})

export type LocalizacaoFormData = z.infer<typeof localizacaoSchema>

// Schema de Recurso (compatível com API)
export const recursoSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
})

export type RecursoFormData = z.infer<typeof recursoSchema>

// Schema de Sala (compatível com API)
export const salaSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  location: z
    .number({ invalid_type_error: 'Localização é obrigatória' })
    .positive('Localização é obrigatória'),
  capacity: z
    .number({ invalid_type_error: 'Capacidade deve ser um número' })
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser maior que zero')
    .max(500, 'Capacidade não pode ser maior que 500'),
  resources: z
    .array(z.number())
    .optional()
})

export type SalaFormData = z.infer<typeof salaSchema>

// Schema de Reserva
export const reservaSchema = z.object({
  sala: z
    .string()
    .min(1, 'Sala é obrigatória'),
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  data: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((date) => {
      const selectedDate = new Date(date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'A data não pode ser no passado'),
  horaInicio: z
    .string()
    .min(1, 'Hora de início é obrigatória')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  horaFim: z
    .string()
    .min(1, 'Hora de fim é obrigatória')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  participantes: z
    .number({ invalid_type_error: 'Número de participantes deve ser um número' })
    .int('Deve ser um número inteiro')
    .positive('Deve ser maior que zero')
    .max(500, 'Não pode ser maior que 500'),
  descricao: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  recursosAdicionais: z
    .array(z.string())
    .optional()
}).refine((data) => {
  // Validar se hora de fim é maior que hora de início
  if (data.horaInicio && data.horaFim) {
    const [horaInicioH, horaInicioM] = data.horaInicio.split(':').map(Number)
    const [horaFimH, horaFimM] = data.horaFim.split(':').map(Number)
    const inicio = horaInicioH * 60 + horaInicioM
    const fim = horaFimH * 60 + horaFimM
    return fim > inicio
  }
  return true
}, {
  message: 'Hora de fim deve ser maior que hora de início',
  path: ['horaFim']
})

export type ReservaFormData = z.infer<typeof reservaSchema>

// Schema de Registro de Usuário
export const registroUsuarioSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  username: z
    .string()
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(150, 'Username deve ter no máximo 150 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username deve conter apenas letras, números, _ e -'),
  first_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(150, 'Nome deve ter no máximo 150 caracteres')
    .optional(),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(150, 'Sobrenome deve ter no máximo 150 caracteres')
    .optional(),
  phone: z
    .string()
    .regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Telefone inválido (formato: (00) 00000-0000)')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  password_confirm: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.password_confirm, {
  message: 'As senhas não coincidem',
  path: ['password_confirm']
})

export type RegistroUsuarioFormData = z.infer<typeof registroUsuarioSchema>

// Schema de Atualização de Perfil
export const atualizarPerfilSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(150, 'Nome deve ter no máximo 150 caracteres')
    .optional()
    .or(z.literal('')),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(150, 'Sobrenome deve ter no máximo 150 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Telefone inválido (formato: (00) 00000-0000)')
    .optional()
    .or(z.literal(''))
})

export type AtualizarPerfilFormData = z.infer<typeof atualizarPerfilSchema>

// Schema de Alteração de Senha
export const alterarSenhaSchema = z.object({
  old_password: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  new_password: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  new_password_confirm: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: 'As senhas não coincidem',
  path: ['new_password_confirm']
})

export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>
