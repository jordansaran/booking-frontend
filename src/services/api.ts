import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// URL base da API - ajuste conforme seu ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
})

// Interceptor de requisição - adiciona token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta - trata erros e refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Se o erro for 401 (não autorizado) e ainda não tentamos fazer refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
          // Não tem refresh token, redirecionar para login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('userRole')
          window.location.href = '/'
          return Promise.reject(error)
        }

        // Tentar renovar o token
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        // Repetir a requisição original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }
        
        return api(originalRequest)
      } catch (refreshError) {
        // Falha ao renovar token, redirecionar para login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('userRole')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
