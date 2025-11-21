import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ArrowLeft, Calendar, Clock, Users, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { bookingService, roomService, locationService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { RoomAPI, LocationAPI, BookingAPI } from '@/types'

// Schema para edição de reserva
const editReservaSchema = z.object({
  room: z
    .number({ invalid_type_error: 'Sala é obrigatória' })
    .positive('Sala é obrigatória'),
  date_booking: z
    .string()
    .min(1, 'Data é obrigatória'),
  start_time: z
    .string()
    .min(1, 'Hora de início é obrigatória'),
  end_time: z
    .string()
    .min(1, 'Hora de fim é obrigatória'),
  has_coffee_break: z
    .boolean()
    .optional(),
  coffee_break_headcount: z
    .number()
    .int()
    .positive()
    .optional()
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time
  }
  return true
}, {
  message: 'Hora de fim deve ser maior que hora de início',
  path: ['end_time']
})

type EditReservaFormData = z.infer<typeof editReservaSchema>

export default function EditarReserva() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [reserva, setReserva] = useState<BookingAPI | null>(null)
  const [salas, setSalas] = useState<RoomAPI[]>([])
  const [localizacoes, setLocalizacoes] = useState<LocationAPI[]>([])
  const [hasCoffeeBreak, setHasCoffeeBreak] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState<EditReservaFormData | null>(null)
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EditReservaFormData>({
    resolver: zodResolver(editReservaSchema),
    defaultValues: {
      room: 0,
      date_booking: '',
      start_time: '',
      end_time: '',
      has_coffee_break: false,
      coffee_break_headcount: undefined
    }
  })

  const roomWatch = watch('room')
  const dateWatch = watch('date_booking')
  const startTimeWatch = watch('start_time')
  const endTimeWatch = watch('end_time')

  // Carrega reserva, salas e localizações
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 EditarReserva - fetchData iniciado', { id, authLoading, userId: user?.id })

      if (!id) {
        console.log('❌ ID da reserva não fornecido')
        setError('ID da reserva não fornecido')
        setLoadingData(false)
        return
      }

      // Aguardar até que a autenticação termine de carregar
      if (authLoading) {
        console.log('⏳ Aguardando autenticação carregar...')
        return
      }

      // Verificar se o usuário está autenticado
      if (!user?.id) {
        console.log('❌ Usuário não autenticado')
        setError('Você precisa estar autenticado para editar reservas')
        setLoadingData(false)
        return
      }

      try {
        setLoadingData(true)
        setError('')
        console.log('📡 Buscando dados da reserva ID:', id)

        const [reservaRes, salasRes, locRes] = await Promise.all([
          bookingService.getById(parseInt(id)),
          roomService.list(),
          locationService.list()
        ])

        console.log('✅ Dados recebidos:', {
          reserva: reservaRes,
          manager: reservaRes.manager,
          currentUserId: user.id,
          salas: salasRes.results.length,
          localizacoes: locRes.results.length
        })

        // Validar se o usuário é o dono da reserva
        if (reservaRes.manager !== user.id) {
          console.log('❌ Usuário não é o dono da reserva', {
            manager: reservaRes.manager,
            userId: user.id
          })
          setError('Você não tem permissão para editar esta reserva')
          setLoadingData(false)
          return
        }

        // Validar se a reserva pode ser editada
        if (reservaRes.status !== 'pending' && reservaRes.status !== 'confirmed') {
          console.log('❌ Status da reserva não permite edição:', reservaRes.status)
          setError('Esta reserva não pode ser editada. Apenas reservas pendentes ou confirmadas podem ser editadas.')
          setLoadingData(false)
          return
        }

        console.log('✅ Validações passaram, carregando formulário...')

        setReserva(reservaRes)
        setSalas(salasRes.results)
        setLocalizacoes(locRes.results)

        // Extrair horários (HH:MM) dos datetimes
        console.log('🕐 Datetimes recebidos:', {
          start_datetime: reservaRes.start_datetime,
          end_datetime: reservaRes.end_datetime
        })

        const startTime = extractTime(reservaRes.start_datetime)
        const endTime = extractTime(reservaRes.end_datetime)

        console.log('⏰ Horários extraídos (HH:MM):', { startTime, endTime })

        if (!startTime || !endTime) {
          console.error('❌ Erro ao extrair horários:', { startTime, endTime })
          setError('Erro ao processar horários da reserva. Formato inválido.')
          setLoadingData(false)
          return
        }

        // Preencher formulário com dados da reserva
        setValue('room', reservaRes.room)
        setValue('date_booking', reservaRes.date_booking)
        setValue('start_time', startTime)
        setValue('end_time', endTime)
        setValue('has_coffee_break', reservaRes.has_coffee_break || false)
        setValue('coffee_break_headcount', reservaRes.coffee_break_headcount)

        setHasCoffeeBreak(reservaRes.has_coffee_break || false)
        console.log('✅ Formulário preenchido com sucesso')
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        console.error('Detalhes do erro:', error.response?.data || error.message)

        if (error.response?.status === 404) {
          setError('Reserva não encontrada.')
        } else if (error.response?.status === 403) {
          setError('Você não tem permissão para acessar esta reserva.')
        } else {
          setError('Erro ao carregar dados da reserva. Tente novamente.')
        }
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [id, user?.id, authLoading, setValue])

  const salaSelecionada = salas.find(s => s.id === roomWatch)
  const localizacaoSala = localizacoes.find(l => l.id === salaSelecionada?.location)

  const onSubmit = async (data: EditReservaFormData) => {
    setFormData(data)
    setConfirmDialogOpen(true)
  }

  const handleConfirmUpdate = async () => {
    if (!formData || !id || !user?.id) return

    try {
      setLoading(true)

      // Converte horários para formato ISO 8601
      const startDatetime = `${formData.date_booking}T${formData.start_time}:00`
      const endDatetime = `${formData.date_booking}T${formData.end_time}:00`

      const apiData: Partial<BookingAPI> = {
        room: formData.room,
        date_booking: formData.date_booking,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        has_coffee_break: hasCoffeeBreak,
        coffee_break_headcount: hasCoffeeBreak ? formData.coffee_break_headcount : undefined
      }

      await bookingService.partialUpdate(parseInt(id), apiData)

      setConfirmDialogOpen(false)
      navigate('/minhas-reservas')
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error)
      alert('Erro ao atualizar reserva. Verifique se o horário está disponível.')
    } finally {
      setLoading(false)
    }
  }

  // Função para obter horários disponíveis
  const getHorariosDisponiveis = (): string[] => {
    const horarios: string[] = []
    for (let i = 8; i <= 18; i++) {
      horarios.push(`${i.toString().padStart(2, '0')}:00`)
      horarios.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return horarios
  }

  const handleVoltar = () => {
    navigate('/minhas-reservas')
  }

  // Função auxiliar para extrair HH:MM de qualquer formato de datetime
  const extractTime = (datetime: string): string => {
    if (!datetime) return ''

    // Regex para encontrar padrão HH:MM em qualquer string
    const timeMatch = datetime.match(/(\d{2}):(\d{2})/)
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`
    }

    // Se não encontrar, tentar criar Date e extrair
    try {
      const date = new Date(datetime)
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }
    } catch (e) {
      console.error('Erro ao parsear datetime:', e)
    }

    return ''
  }

  // Tela de erro
  if (error && !loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleVoltar}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar reserva</h2>
                  <p className="text-gray-600">{error}</p>
                  <Button
                    onClick={handleVoltar}
                    className="mt-4"
                  >
                    Voltar para Minhas Reservas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando dados da reserva...</p>
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
            onClick={handleVoltar}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Reserva</h1>
          <p className="text-gray-600 mt-1">Atualize as informações da sua reserva</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Reserva</CardTitle>
                <CardDescription>
                  Atualize os dados da reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="room">Sala *</Label>
                    <Select
                      id="room"
                      {...register('room', { valueAsNumber: true })}
                      aria-invalid={errors.room ? 'true' : 'false'}
                    >
                      <option value={0}>Selecione uma sala...</option>
                      {salas.map((sala) => {
                        const loc = localizacoes.find(l => l.id === sala.location)
                        return (
                          <option key={sala.id} value={sala.id}>
                            {sala.name} - {loc?.name || 'Sem localização'}
                          </option>
                        )
                      })}
                    </Select>
                    {errors.room && (
                      <p className="text-sm text-red-600">{errors.room.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_booking">Data *</Label>
                      <Input
                        id="date_booking"
                        type="date"
                        {...register('date_booking')}
                        min={new Date().toISOString().split('T')[0]}
                        aria-invalid={errors.date_booking ? 'true' : 'false'}
                      />
                      {errors.date_booking && (
                        <p className="text-sm text-red-600">{errors.date_booking.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_time">Hora Início *</Label>
                      <Controller
                        name="start_time"
                        control={control}
                        render={({ field }) => (
                          <Select
                            id="start_time"
                            {...field}
                            aria-invalid={errors.start_time ? 'true' : 'false'}
                          >
                            <option value="">Selecione...</option>
                            {getHorariosDisponiveis().map((horario) => (
                              <option key={horario} value={horario}>
                                {horario}
                              </option>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.start_time && (
                        <p className="text-sm text-red-600">{errors.start_time.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time">Hora Fim *</Label>
                      <Controller
                        name="end_time"
                        control={control}
                        render={({ field }) => (
                          <Select
                            id="end_time"
                            {...field}
                            aria-invalid={errors.end_time ? 'true' : 'false'}
                          >
                            <option value="">Selecione...</option>
                            {getHorariosDisponiveis().map((horario) => (
                              <option key={horario} value={horario}>
                                {horario}
                              </option>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.end_time && (
                        <p className="text-sm text-red-600">{errors.end_time.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="has_coffee_break"
                        checked={hasCoffeeBreak}
                        onChange={(e) => {
                          setHasCoffeeBreak(e.target.checked)
                          setValue('has_coffee_break', e.target.checked)
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="has_coffee_break" className="font-normal cursor-pointer">
                        Incluir Coffee Break
                      </Label>
                    </div>

                    {hasCoffeeBreak && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="coffee_break_headcount">Número de pessoas para o coffee</Label>
                        <Input
                          id="coffee_break_headcount"
                          type="number"
                          min="1"
                          placeholder="Ex: 10"
                          {...register('coffee_break_headcount', { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting || loading}>
                      {(isSubmitting || loading) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                      )}
                      {(isSubmitting || loading) ? 'Atualizando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVoltar}
                      disabled={isSubmitting || loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
                <CardDescription>Detalhes da reserva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {salaSelecionada ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Sala</p>
                      <p className="text-sm text-gray-900 font-semibold">{salaSelecionada.name}</p>
                    </div>

                    {localizacaoSala && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Localização</p>
                          <p className="text-sm text-gray-600">{localizacaoSala.name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacidade</p>
                        <p className="text-sm text-gray-600">{salaSelecionada.capacity} pessoas</p>
                      </div>
                    </div>

                    {dateWatch && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Data</p>
                          <p className="text-sm text-gray-600">
                            {new Date(dateWatch + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {startTimeWatch && endTimeWatch && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Horário</p>
                          <p className="text-sm text-gray-600">
                            {startTimeWatch} - {endTimeWatch}
                          </p>
                        </div>
                      </div>
                    )}

                    {hasCoffeeBreak && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700">Coffee Break</p>
                        <p className="text-sm text-green-600">Incluído</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Selecione uma sala para ver os detalhes</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirmar Alterações"
        description={`Tem certeza que deseja atualizar esta reserva para ${salaSelecionada?.name || 'esta sala'} em ${formData?.date_booking ? new Date(formData.date_booking + 'T00:00:00').toLocaleDateString('pt-BR') : ''} das ${formData?.start_time || ''} às ${formData?.end_time || ''}?`}
        type="confirm"
        confirmText="Confirmar Alterações"
        onConfirm={handleConfirmUpdate}
        loading={loading}
      />
    </div>
  )
}
