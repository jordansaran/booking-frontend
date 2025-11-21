import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ArrowLeft, Calendar, Clock, Users, MapPin, Loader2 } from 'lucide-react'
import { bookingService, roomService, locationService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { RoomAPI, LocationAPI, BookingAPI } from '@/types'

// Schema simplificado para a API
const reservaApiSchema = z.object({
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

type ReservaApiFormData = z.infer<typeof reservaApiSchema>

export default function ReservaSala() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const salaId = searchParams.get('sala')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [salas, setSalas] = useState<RoomAPI[]>([])
  const [localizacoes, setLocalizacoes] = useState<LocationAPI[]>([])
  const [hasCoffeeBreak, setHasCoffeeBreak] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ReservaApiFormData | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ReservaApiFormData>({
    resolver: zodResolver(reservaApiSchema),
    defaultValues: {
      room: salaId ? parseInt(salaId) : 0,
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

  // Carrega salas e localizações
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const [salasRes, locRes] = await Promise.all([
          roomService.list(),
          locationService.list()
        ])
        setSalas(salasRes.results)
        setLocalizacoes(locRes.results)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        alert('Erro ao carregar dados. Tente novamente.')
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const salaSelecionada = salas.find(s => s.id === roomWatch)
  const localizacaoSala = localizacoes.find(l => l.id === salaSelecionada?.location)

  const onSubmit = async (data: ReservaApiFormData) => {
    setFormData(data)
    setConfirmDialogOpen(true)
  }

  const handleConfirmReserva = async () => {
    if (!formData) return

    try {
      setLoading(true)

      // Validar se usuário está autenticado
      if (!user?.id) {
        alert('Usuário não autenticado. Faça login novamente.')
        navigate('/login')
        return
      }

      // Converte horários para formato ISO 8601
      const startDatetime = `${formData.date_booking}T${formData.start_time}:00`
      const endDatetime = `${formData.date_booking}T${formData.end_time}:00`

      const apiData: Omit<BookingAPI, 'id' | 'created_at' | 'updated_at'> = {
        room: formData.room,
        date_booking: formData.date_booking,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        manager: user.id, // Usa o ID do usuário logado
        has_coffee_break: hasCoffeeBreak,
        coffee_break_headcount: hasCoffeeBreak ? formData.coffee_break_headcount : undefined
      }

      await bookingService.create(apiData)

      setConfirmDialogOpen(false)
      navigate('/minhas-reservas')
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      alert('Erro ao criar reserva. Verifique se o horário está disponível.')
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  const handleVoltar = () => {
    // Usuários normais voltam para suas reservas, admin/manager voltam para salas
    if (user?.role === 'user') {
      navigate('/minhas-reservas')
    } else {
      navigate('/salas')
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Nova Reserva</h1>
          <p className="text-gray-600 mt-1">Agende sua sala de reunião</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Reserva</CardTitle>
                <CardDescription>
                  Preencha os dados para realizar a reserva
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
                      {(isSubmitting || loading) ? 'Reservando...' : 'Confirmar Reserva'}
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
        title="Confirmar Reserva"
        description={`Tem certeza que deseja reservar ${salaSelecionada?.name || 'esta sala'} para ${formData?.date_booking ? new Date(formData.date_booking + 'T00:00:00').toLocaleDateString('pt-BR') : ''} das ${formData?.start_time || ''} às ${formData?.end_time || ''}?`}
        type="confirm"
        confirmText="Confirmar Reserva"
        onConfirm={handleConfirmReserva}
        loading={loading}
      />
    </div>
  )
}
