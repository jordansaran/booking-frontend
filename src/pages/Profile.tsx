import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { User, Lock, Monitor, Loader2, Save, Trash2, CheckCircle2 } from 'lucide-react'
import { userService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { atualizarPerfilSchema, alterarSenhaSchema, type AtualizarPerfilFormData, type AlterarSenhaFormData, type UserAPI, type UserSession } from '@/types'

export default function Profile() {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [userData, setUserData] = useState<UserAPI | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form de atualização de perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch: watchProfile,
    reset: resetProfile
  } = useForm<AtualizarPerfilFormData>({
    resolver: zodResolver(atualizarPerfilSchema)
  })

  // Form de alteração de senha
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema)
  })

  // Carregar dados do usuário
  useEffect(() => {
    fetchUserData()
    fetchSessions()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const data = await userService.getMe()
      setUserData(data)

      // Preencher form com dados atuais
      resetProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || ''
      })
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      setErrorMessage('Erro ao carregar dados do usuário.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true)
      const response = await userService.listSessions()
      setSessions(response.results)
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

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

    setProfileValue('phone', value)
  }

  // Atualizar perfil
  const onUpdateProfile = async (data: AtualizarPerfilFormData) => {
    try {
      setUpdateLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      await userService.updateMe({
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        phone: data.phone || undefined
      })

      // Recarregar dados para atualizar a interface
      await fetchUserData()

      setSuccessMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      setErrorMessage('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Alterar senha
  const onChangePassword = async (data: AlterarSenhaFormData) => {
    try {
      setPasswordLoading(true)
      setPasswordSuccess(false)

      await userService.changePassword(data)

      setPasswordSuccess(true)
      resetPassword()

      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)

      if (error.response?.data?.old_password) {
        setErrorMessage('Senha atual incorreta.')
      } else if (error.response?.data?.new_password) {
        setErrorMessage(`Nova senha: ${error.response.data.new_password[0]}`)
      } else {
        setErrorMessage('Erro ao alterar senha. Tente novamente.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  // Deletar sessão
  const handleDeleteSession = (sessionId: number) => {
    setDeleteSessionId(sessionId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return

    try {
      setDeleteLoading(true)
      await userService.deleteSession(deleteSessionId)
      setSessions(prev => prev.filter(s => s.id !== deleteSessionId))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Erro ao deletar sessão:', error)
      alert('Erro ao encerrar sessão. Tente novamente.')
    } finally {
      setDeleteLoading(false)
      setDeleteSessionId(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e configurações</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              Senha
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Monitor className="h-4 w-4 mr-2" />
              Sessões
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                  {/* Email e Username (read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userData?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={userData?.username || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">O username não pode ser alterado</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <div>
                      <Badge variant={userData?.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {userData?.role_display || userData?.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Nome e Sobrenome */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nome</Label>
                      <Input
                        id="first_name"
                        placeholder="Seu nome"
                        {...registerProfile('first_name')}
                        disabled={updateLoading}
                      />
                      {profileErrors.first_name && (
                        <p className="text-sm text-red-600">{profileErrors.first_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Sobrenome</Label>
                      <Input
                        id="last_name"
                        placeholder="Seu sobrenome"
                        {...registerProfile('last_name')}
                        disabled={updateLoading}
                      />
                      {profileErrors.last_name && (
                        <p className="text-sm text-red-600">{profileErrors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={watchProfile('phone') || ''}
                      onChange={handlePhoneChange}
                      disabled={updateLoading}
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  {/* Data de cadastro */}
                  <div className="space-y-2">
                    <Label>Cadastrado em</Label>
                    <p className="text-sm text-gray-600">{formatDate(userData?.date_joined)}</p>
                  </div>

                  {/* Botão de salvar */}
                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Senha */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorMessage && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Senha alterada com sucesso!
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                  {/* Senha atual */}
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Senha Atual</Label>
                    <Input
                      id="old_password"
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword('old_password')}
                      disabled={passwordLoading}
                    />
                    {passwordErrors.old_password && (
                      <p className="text-sm text-red-600">{passwordErrors.old_password.message}</p>
                    )}
                  </div>

                  {/* Nova senha */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nova Senha</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword('new_password')}
                      disabled={passwordLoading}
                    />
                    {passwordErrors.new_password && (
                      <p className="text-sm text-red-600">{passwordErrors.new_password.message}</p>
                    )}
                  </div>

                  {/* Confirmar nova senha */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password_confirm">Confirmar Nova Senha</Label>
                    <Input
                      id="new_password_confirm"
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword('new_password_confirm')}
                      disabled={passwordLoading}
                    />
                    {passwordErrors.new_password_confirm && (
                      <p className="text-sm text-red-600">{passwordErrors.new_password_confirm.message}</p>
                    )}
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

                  {/* Botão de salvar */}
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sessões */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Sessões Ativas</CardTitle>
                <CardDescription>
                  Gerencie os dispositivos com acesso à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma sessão ativa encontrada.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <Monitor className="h-5 w-5 text-gray-500 mt-1" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {session.device_name || 'Dispositivo desconhecido'}
                              </p>
                              {session.is_current && (
                                <Badge variant="default" className="text-xs">
                                  Sessão atual
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {session.device_type && `${session.device_type} • `}
                              {session.ip_address}
                            </p>
                            {session.location && (
                              <p className="text-sm text-gray-500">{session.location}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Última atividade: {formatDate(session.last_activity)}
                            </p>
                          </div>
                        </div>

                        {!session.is_current && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSession(session.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de confirmação para deletar sessão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Encerrar Sessão"
        description="Tem certeza que deseja encerrar esta sessão? O dispositivo será desconectado."
        type="delete"
        confirmText="Encerrar"
        onConfirm={confirmDeleteSession}
        loading={deleteLoading}
      />
    </div>
  )
}
