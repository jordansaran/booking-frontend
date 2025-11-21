// Exportar todos os serviços
export { default as api } from './api'
export { authService } from './authService'
export { roomService } from './roomService'
export { resourceService } from './resourceService'
export { bookingService } from './bookingService'
export { locationService } from './locationService'
export { userService } from './userService'

// Exportar tipos dos serviços
export type { RoomQueryParams } from './roomService'
export type { ResourceQueryParams } from './resourceService'
export type { BookingQueryParams } from './bookingService'
export type { LocationQueryParams } from './locationService'
export type { UserQueryParams } from './userService'
