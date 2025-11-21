import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, AlertCircle } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage('')

      // Chamar API de login usando AuthContext
      await login({
        email: data.email,
        password: data.password
      })

      // Redirecionar baseado no role do usuário
      const user = authService.getCurrentUser()
      if (user?.role === 'user') {
        navigate('/minhas-reservas')
      } else {
        navigate('/salas')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)

      // Tratar diferentes tipos de erro
      if (error.response?.status === 401) {
        setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.')
      } else if (error.response?.status === 400) {
        setErrorMessage('Dados inválidos. Verifique os campos e tente novamente.')
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('Tempo de conexão esgotado. Verifique sua conexão e tente novamente.')
      } else if (error.code === 'ERR_NETWORK') {
        setErrorMessage('Erro de rede. Verifique se o servidor está disponível.')
      } else {
        setErrorMessage('Erro ao fazer login. Tente novamente mais tarde.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Sistema de Reserva de Salas</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Link para registro */}
            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
