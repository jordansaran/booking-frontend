import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Clock, MapPin, Trash2, Edit, Loader2, CheckCircle, XCircle, User as UserIcon, Monitor, Users, Coffee, Building, Phone, Mail, Timer } from 'lucide-react'
import { bookingService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { BookingAPI } from '@/types'

export default function MinhasReservas() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reservas, setReservas] = useState<BookingAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState<number | null>(null)
  const [expandedReserva, setExpandedReserva] = useState<number | null>(null)

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin'

  // Carrega reservas da API (agora vem com todos os dados necessários)
  const fetchReservas = async () => {
    try {
      setLoading(true)
      setError(null)

      const reservasRes = await bookingService.list()
      setReservas(reservasRes.results || [])
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  const getStatusBadge = (booking: BookingAPI): JSX.Element => {
    if (booking.status === 'cancelled') {
      return <Badge variant="destructive">Cancelada</Badge>
    }
    if (booking.status === 'pending') {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendente</Badge>
    }
    if (booking.status === 'confirmed') {
      const hoje = new Date().toISOString().split('T')[0]
      if (booking.date_booking < hoje) {
        return <Badge variant="outline">Concluída</Badge>
      }
      return <Badge variant="default" className="bg-green-600">Confirmada</Badge>
    }
    if (booking.status === 'completed') {
      return <Badge variant="outline">Concluída</Badge>
    }
    return <Badge variant="outline">Desconhecido</Badge>
  }

  const formatarData = (data: string): string => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatarHora = (datetime: string): string => {
    return new Date(datetime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarDataHora = (datetime: string): string => {
    return new Date(datetime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarDuracao = (minutos?: number): string => {
    if (!minutos) return ''
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    if (horas === 0) return `${mins}min`
    if (mins === 0) return `${horas}h`
    return `${horas}h ${mins}min`
  }

  const handleCancelClick = (id: number): void => {
    setCancelId(id)
    setCancelReason('')
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async (): Promise<void> => {
    if (!cancelId) return

    try {
      setCancelLoading(true)
      await bookingService.cancel(cancelId, cancelReason || 'Cancelado pelo usuário')
      await fetchReservas()
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err)
      alert('Erro ao cancelar reserva. Tente novamente.')
    } finally {
      setCancelLoading(false)
      setCancelId(null)
    }
  }

  const handleConfirm = async (id: number): Promise<void> => {
    try {
      setConfirmLoading(id)
      await bookingService.confirm(id)
      await fetchReservas()
    } catch (err) {
      console.error('Erro ao confirmar reserva:', err)
      alert('Erro ao confirmar reserva. Tente novamente.')
    } finally {
      setConfirmLoading(null)
    }
  }

  const handleReject = async (id: number): Promise<void> => {
    const motivo = prompt('Motivo da rejeição (opcional):')
    try {
      setConfirmLoading(id)
      await bookingService.cancel(id, motivo || 'Rejeitado pelo gerente')
      await fetchReservas()
    } catch (err) {
      console.error('Erro ao rejeitar reserva:', err)
      alert('Erro ao rejeitar reserva. Tente novamente.')
    } finally {
      setConfirmLoading(null)
    }
  }

  // Filtrar reservas baseado no role
  const reservasFiltradas = isManagerOrAdmin
    ? reservas
    : reservas.filter(r => r.manager === user?.id)

  // Separar por status
  const hoje = new Date().toISOString().split('T')[0]
  const reservasPendentes = reservasFiltradas.filter(r => r.status === 'pending')
  const reservasFuturas = reservasFiltradas.filter(r =>
    r.date_booking >= hoje && r.status === 'confirmed'
  )
  const reservasPassadas = reservasFiltradas.filter(r =>
    r.date_booking < hoje || r.status === 'cancelled' || r.status === 'completed'
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando reservas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchReservas}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderiza card expandido com todos os detalhes para usuário comum
  const renderReservationCard = (reserva: BookingAPI) => {
    const isExpanded = expandedReserva === reserva.id

    return (
      <Card key={reserva.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{reserva.room_name}</CardTitle>
                {getStatusBadge(reserva)}
              </div>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatarData(reserva.date_booking)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatarHora(reserva.start_datetime)} - {formatarHora(reserva.end_datetime)}
                </span>
                {reserva.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {formatarDuracao(reserva.duration_minutes)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(reserva.status === 'pending' || reserva.status === 'confirmed') && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/reservas/editar/${reserva.id}`)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancelClick(reserva.id!)}
                    title="Cancelar"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedReserva(isExpanded ? null : reserva.id!)}
              >
                {isExpanded ? 'Ver menos' : 'Ver detalhes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* Informações da Sala */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informações da Sala
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium">{reserva.room_name}</p>
                </div>
                {reserva.room_capacity && (
                  <div>
                    <span className="text-gray-500">Capacidade:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {reserva.room_capacity} pessoas
                    </p>
                  </div>
                )}
                {reserva.room_resources && reserva.room_resources.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Recursos disponíveis:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {reserva.room_resources.map((recurso, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Monitor className="h-3 w-3 mr-1" />
                          {recurso}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Localização */}
            {reserva.location && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Local:</span>
                    <p className="font-medium">{reserva.location}</p>
                  </div>
                  {reserva.location_address && (
                    <div>
                      <span className="text-gray-500">Endereço:</span>
                      <p className="font-medium">{reserva.location_address}</p>
                    </div>
                  )}
                  {reserva.location_city && (
                    <div>
                      <span className="text-gray-500">Cidade:</span>
                      <p className="font-medium">{reserva.location_city}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coffee Break */}
            {reserva.has_coffee_break && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Coffee Break
                </h4>
                <div className="text-sm">
                  <span className="text-gray-500">Número de pessoas:</span>
                  <p className="font-medium">{reserva.coffee_break_headcount || 'Não informado'}</p>
                </div>
              </div>
            )}

            {/* Status da Reserva */}
            {(reserva.confirmed_by_name || reserva.cancelled_by_name) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Status da Reserva</h4>
                <div className="space-y-2 text-sm">
                  {reserva.confirmed_by_name && reserva.confirmed_at && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Confirmada</p>
                        <p className="text-gray-600">
                          Por {reserva.confirmed_by_name} em {formatarDataHora(reserva.confirmed_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  {reserva.cancelled_by_name && reserva.cancelled_at && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">Cancelada</p>
                        <p className="text-gray-600">
                          Por {reserva.cancelled_by_name} em {formatarDataHora(reserva.cancelled_at)}
                        </p>
                        {reserva.cancellation_reason && (
                          <p className="text-gray-700 mt-1">
                            <span className="font-medium">Motivo:</span> {reserva.cancellation_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            {reserva.notes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Observações</h4>
                <p className="text-sm text-gray-700">{reserva.notes}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  // Renderiza linha de tabela para Manager/Admin
  const renderReservationRow = (reserva: BookingAPI, showActions: boolean = true, showManagerName: boolean = false, showRecursos: boolean = false) => {
    return (
      <TableRow key={reserva.id}>
        {showManagerName && (
          <TableCell>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{reserva.manager_name || `ID: ${reserva.manager}`}</span>
              </div>
              {reserva.manager_email && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  {reserva.manager_email}
                </div>
              )}
              {reserva.manager_phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3" />
                  {reserva.manager_phone}
                </div>
              )}
            </div>
          </TableCell>
        )}
        <TableCell>
          <div>
            <p className="font-medium">{reserva.room_name}</p>
            {reserva.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {reserva.location}
              </p>
            )}
            {reserva.notes && (
              <p className="text-xs text-gray-500 mt-1">{reserva.notes}</p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <p className="text-sm flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatarData(reserva.date_booking)}
            </p>
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatarHora(reserva.start_datetime)} - {formatarHora(reserva.end_datetime)}
            </p>
            {reserva.duration_minutes && (
              <p className="text-xs text-gray-500 flex items-center">
                <Timer className="h-3 w-3 mr-1" />
                {formatarDuracao(reserva.duration_minutes)}
              </p>
            )}
          </div>
        </TableCell>
        {showRecursos && (
          <TableCell>
            {reserva.room_resources && reserva.room_resources.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {reserva.room_resources.map((recurso, index) => (
                  <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    {recurso}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500">Sem recursos</span>
            )}
          </TableCell>
        )}
        <TableCell>
          {getStatusBadge(reserva)}
        </TableCell>
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {user?.role === 'manager' && reserva.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleConfirm(reserva.id!)}
                  disabled={confirmLoading === reserva.id}
                  title="Aprovar"
                >
                  {confirmLoading === reserva.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReject(reserva.id!)}
                  disabled={confirmLoading === reserva.id}
                  title="Rejeitar"
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
            {(reserva.status === 'pending' || reserva.status === 'confirmed') && !isManagerOrAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/reservas/editar/${reserva.id}`)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCancelClick(reserva.id!)}
                  title="Cancelar"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isManagerOrAdmin ? 'Gerenciar Reservas' : 'Minhas Reservas'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isManagerOrAdmin
                ? 'Visualize e gerencie todas as reservas de salas'
                : 'Gerencie suas reservas de salas'}
            </p>
          </div>
          {!isManagerOrAdmin && (
            <Button onClick={() => navigate('/reservas/nova')}>
              <Calendar className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {reservasPendentes.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Calendar className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reservasPendentes.length}</div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isManagerOrAdmin ? 'Próximas' : 'Próximas Reservas'}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservasFuturas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reservasFiltradas.filter(r => r.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservasFiltradas.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Manager e Admin */}
        {isManagerOrAdmin && reservasPendentes.length > 0 ? (
          <Tabs defaultValue="pending" className="mb-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pendentes ({reservasPendentes.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Próximas ({reservasFuturas.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                Histórico ({reservasPassadas.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas Pendentes de Aprovação</CardTitle>
                  <CardDescription>
                    Aprove ou rejeite as solicitações de reserva
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Sala</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Recursos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservasPendentes.map((reserva) => renderReservationRow(reserva, true, true, true))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Reservas</CardTitle>
                  <CardDescription>Reservas confirmadas para os próximos dias</CardDescription>
                </CardHeader>
                <CardContent>
                  {reservasFuturas.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhuma reserva futura</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Sala</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Recursos</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservasFuturas.map((reserva) => renderReservationRow(reserva, false, true, true))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico</CardTitle>
                  <CardDescription>Reservas concluídas ou canceladas</CardDescription>
                </CardHeader>
                <CardContent>
                  {reservasPassadas.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum histórico</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Sala</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Recursos</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservasPassadas.map((reserva) => renderReservationRow(reserva, false, true, true))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* Reservas Pendentes - Para Users (Cards) */}
            {!isManagerOrAdmin && reservasPendentes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Reservas Pendentes</h2>
                <p className="text-gray-600 mb-4">Aguardando aprovação do gerente</p>
                {reservasPendentes.map((reserva) => renderReservationCard(reserva))}
              </div>
            )}

            {/* Próximas Reservas - Para Users (Cards) / Managers (Tabela) */}
            {reservasFuturas.length > 0 && (
              <>
                {!isManagerOrAdmin ? (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Próximas Reservas</h2>
                    <p className="text-gray-600 mb-4">Suas reservas agendadas para os próximos dias</p>
                    {reservasFuturas.map((reserva) => renderReservationCard(reserva))}
                  </div>
                ) : (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Próximas Reservas</CardTitle>
                      <CardDescription>Reservas confirmadas para os próximos dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Sala</TableHead>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Recursos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reservasFuturas.map((reserva) => renderReservationRow(reserva, true, true, true))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Reservas Passadas - Para Users (Cards) / Managers (Tabela) */}
            {reservasPassadas.length > 0 && (
              <>
                {!isManagerOrAdmin ? (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Histórico de Reservas</h2>
                    <p className="text-gray-600 mb-4">Suas reservas concluídas ou canceladas</p>
                    {reservasPassadas.map((reserva) => renderReservationCard(reserva))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Reservas</CardTitle>
                      <CardDescription>Reservas concluídas ou canceladas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Solicitante</TableHead>
                            <TableHead>Sala</TableHead>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Recursos</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reservasPassadas.map((reserva) => renderReservationRow(reserva, false, true, true))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {reservasFiltradas.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma reserva encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {isManagerOrAdmin
                  ? 'Não há reservas no sistema'
                  : 'Você ainda não fez nenhuma reserva de sala'}
              </p>
              {!isManagerOrAdmin && (
                <Button onClick={() => navigate('/reservas/nova')}>
                  Fazer Primeira Reserva
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog personalizado para cancelamento com justificativa */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo do cancelamento. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">
                Motivo do cancelamento {!isManagerOrAdmin && '(opcional)'}
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Digite o motivo do cancelamento..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                disabled={cancelLoading}
              />
              <p className="text-xs text-gray-500">
                Este motivo será registrado no histórico da reserva.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
