import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, User, Mail, Phone, Lock, Shield } from 'lucide-react'
import { userService } from '@/services'
import type { UserAPI } from '@/types'

// Schema de validação para criar usuário
const criarUsuarioSchema = z.object({
  username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  password_confirm: z.string().min(8, 'Confirmação de senha obrigatória'),
  role: z.enum(['admin', 'manager', 'user'], {
    errorMap: () => ({ message: 'Selecione um perfil válido' })
  })
}).refine((data) => data.password === data.password_confirm, {
  message: 'As senhas não coincidem',
  path: ['password_confirm']
})

// Schema de validação para editar usuário
const editarUsuarioSchema = z.object({
  username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'user'], {
    errorMap: () => ({ message: 'Selecione um perfil válido' })
  })
})

type CriarUsuarioFormData = z.infer<typeof criarUsuarioSchema>
type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>

export default function FormularioUsuario() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditMode)
  const [usuario, setUsuario] = useState<UserAPI | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CriarUsuarioFormData | EditarUsuarioFormData>({
    resolver: zodResolver(isEditMode ? editarUsuarioSchema : criarUsuarioSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'user',
      ...(isEditMode ? {} : { password: '', password_confirm: '' })
    }
  })

  // Carrega usuário se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchUsuario = async () => {
        try {
          setLoadingData(true)
          const data = await userService.getById(parseInt(id))
          setUsuario(data)

          // Preencher formulário
          setValue('username', data.username)
          setValue('email', data.email)
          setValue('first_name', data.first_name || '')
          setValue('last_name', data.last_name || '')
          setValue('phone', data.phone || '')
          setValue('role', data.role as 'admin' | 'manager' | 'user')
        } catch (error) {
          console.error('Erro ao carregar usuário:', error)
          alert('Erro ao carregar usuário. Tente novamente.')
          navigate('/usuarios')
        } finally {
          setLoadingData(false)
        }
      }
      fetchUsuario()
    }
  }, [id, isEditMode, navigate, setValue])

  const onSubmit = async (data: CriarUsuarioFormData | EditarUsuarioFormData) => {
    try {
      setLoading(true)

      if (isEditMode && id) {
        // Editar usuário
        await userService.partialUpdate(parseInt(id), {
          username: data.username,
          email: data.email,
          first_name: data.first_name || undefined,
          last_name: data.last_name || undefined,
          phone: data.phone || undefined,
          role: data.role
        })
      } else {
        // Criar usuário
        const createData = data as CriarUsuarioFormData
        await userService.create({
          username: createData.username,
          email: createData.email,
          password: createData.password,
          password_confirm: createData.password_confirm,
          first_name: createData.first_name || undefined,
          last_name: createData.last_name || undefined,
          phone: createData.phone || undefined,
          role: createData.role
        })
      }

      navigate('/usuarios')
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)

      // Tratar erros específicos
      if (error.response?.data) {
        const errorData = error.response.data
        let errorMessage = 'Erro ao salvar usuário.'

        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`
        } else if (errorData.password) {
          errorMessage = `Senha: ${errorData.password[0]}`
        }

        alert(errorMessage)
      } else {
        alert('Erro ao salvar usuário. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/usuarios')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Informações do Usuário' : 'Dados do Novo Usuário'}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Atualize os dados do usuário conforme necessário'
                : 'Preencha os dados para criar um novo usuário'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input
                      id="first_name"
                      placeholder="João"
                      {...register('first_name')}
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
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="joao.silva"
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contato
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao.silva@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Senha (apenas para criar) */}
              {!isEditMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Senha
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirm">Confirmar Senha *</Label>
                      <Input
                        id="password_confirm"
                        type="password"
                        placeholder="••••••••"
                        {...register('password_confirm')}
                      />
                      {errors.password_confirm && (
                        <p className="text-sm text-red-600">{errors.password_confirm.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Perfil */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Perfil de Acesso
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="role">Perfil *</Label>
                  <Select
                    id="role"
                    {...register('role')}
                  >
                    <option value="user">Usuário</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    <strong>Usuário:</strong> Pode criar e gerenciar suas próprias reservas.<br />
                    <strong>Manager:</strong> Pode aprovar/rejeitar reservas e visualizar todas.<br />
                    <strong>Admin:</strong> Acesso total ao sistema, incluindo gerenciamento de usuários.
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting || loading}>
                  {(isSubmitting || loading) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {(isSubmitting || loading) ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Usuário')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/usuarios')}
                  disabled={isSubmitting || loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
