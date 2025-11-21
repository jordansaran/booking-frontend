import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Loader2, UserPlus, ArrowLeft } from 'lucide-react'
import { userService } from '@/services'
import { registroUsuarioSchema, type RegistroUsuarioFormData } from '@/types'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegistroUsuarioFormData>({
    resolver: zodResolver(registroUsuarioSchema)
  })

  // Máscara de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 0) {
      value = `(${value}`
    }

    setValue('phone', value)
  }

  const onSubmit = async (data: RegistroUsuarioFormData) => {
    try {
      setLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      await userService.register({
        email: data.email,
        username: data.username,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        phone: data.phone || undefined,
        password: data.password,
        password_confirm: data.password_confirm
      })

      setSuccessMessage('Cadastro realizado com sucesso! Redirecionando para login...')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error)

      if (error.response?.data) {
        const errorData = error.response.data

        // Verificar erros específicos de campo
        if (errorData.email) {
          setErrorMessage(`Email: ${errorData.email[0]}`)
        } else if (errorData.username) {
          setErrorMessage(`Username: ${errorData.username[0]}`)
        } else if (errorData.password) {
          setErrorMessage(`Senha: ${errorData.password[0]}`)
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail)
        } else {
          setErrorMessage('Erro ao realizar cadastro. Verifique os dados e tente novamente.')
        }
      } else {
        setErrorMessage('Erro ao realizar cadastro. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-primary rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Mensagens de erro/sucesso */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Email e Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="usuario123"
                  {...register('username')}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  placeholder="João"
                  {...register('first_name')}
                  disabled={loading}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  placeholder="Silva"
                  {...register('last_name')}
                  disabled={loading}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={watch('phone') || ''}
                onChange={handlePhoneChange}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Senha e Confirmar Senha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">
                  Confirmar Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password_confirm"
                  type="password"
                  placeholder="••••••••"
                  {...register('password_confirm')}
                  disabled={loading}
                />
                {errors.password_confirm && (
                  <p className="text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>

            {/* Requisitos da senha */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">Requisitos da senha:</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Mínimo de 8 caracteres</li>
                <li>Pelo menos uma letra maiúscula</li>
                <li>Pelo menos uma letra minúscula</li>
                <li>Pelo menos um número</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/login')}
                disabled={loading}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Login
              </Button>
            </div>

            {/* Link para login */}
            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
