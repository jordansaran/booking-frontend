import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { roomService, locationService, resourceService } from '@/services'
import { salaSchema, type SalaFormData, type RoomAPI, type LocationAPI, type ResourceAPI } from '@/types'

export default function FormularioSala() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdicao = !!id

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [localizacoes, setLocalizacoes] = useState<LocationAPI[]>([])
  const [recursos, setRecursos] = useState<ResourceAPI[]>([])
  const [recursosSelecionados, setRecursosSelecionados] = useState<number[]>([])
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState<SalaFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm<SalaFormData>({
    resolver: zodResolver(salaSchema),
    defaultValues: {
      name: '',
      location: 0,
      capacity: 1,
      resources: []
    }
  })

  // Carrega localizações e recursos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        const [locRes, recRes] = await Promise.all([
          locationService.list(),
          resourceService.list()
        ])
        setLocalizacoes(locRes.results)
        setRecursos(recRes.results)

        // Se for edição, carrega os dados da sala
        if (isEdicao && id) {
          const salaData = await roomService.getById(Number(id))
          reset({
            name: salaData.name,
            location: salaData.location,
            capacity: salaData.capacity,
            resources: salaData.resources || []
          })
          setRecursosSelecionados(salaData.resources || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        alert('Erro ao carregar dados. Tente novamente.')
        navigate('/salas')
      } finally {
        setLoadingData(false)
      }
    }

    fetchInitialData()
  }, [id, isEdicao, reset, navigate])

  const handleRecursoChange = (recursoId: number) => {
    const novosRecursos = recursosSelecionados.includes(recursoId)
      ? recursosSelecionados.filter(r => r !== recursoId)
      : [...recursosSelecionados, recursoId]

    setRecursosSelecionados(novosRecursos)
    setValue('resources', novosRecursos)
  }

  const onSubmit = async (data: SalaFormData) => {
    setFormData(data)
    setConfirmDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!formData) return

    try {
      setLoading(true)

      const apiData: Omit<RoomAPI, 'id' | 'created_at' | 'updated_at' | 'all_bookings'> = {
        name: formData.name,
        capacity: formData.capacity,
        location: formData.location,
        resources: recursosSelecionados
      }

      if (isEdicao && id) {
        await roomService.update(Number(id), apiData)
      } else {
        await roomService.create(apiData)
      }

      setConfirmDialogOpen(false)
      navigate('/salas')
    } catch (error) {
      console.error('Erro ao salvar sala:', error)
      alert('Erro ao salvar sala. Tente novamente.')
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/salas')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdicao ? 'Editar Sala' : 'Nova Sala'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdicao ? 'Atualize as informações da sala' : 'Cadastre uma nova sala de reunião'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Sala</CardTitle>
            <CardDescription>
              Preencha os dados da sala de reunião
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Sala *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Sala Inovação"
                    {...register('name')}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização *</Label>
                  <Select
                    id="location"
                    {...register('location', { valueAsNumber: true })}
                    aria-invalid={errors.location ? 'true' : 'false'}
                  >
                    <option value={0}>Selecione...</option>
                    {localizacoes.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (pessoas) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="500"
                  placeholder="Ex: 10"
                  {...register('capacity', { valueAsNumber: true })}
                  aria-invalid={errors.capacity ? 'true' : 'false'}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>

              {recursos.length > 0 && (
                <div className="space-y-2">
                  <Label>Recursos Disponíveis</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {recursos.map((recurso) => (
                      <div key={recurso.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`recurso-${recurso.id}`}
                          checked={recursosSelecionados.includes(recurso.id!)}
                          onChange={() => handleRecursoChange(recurso.id!)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`recurso-${recurso.id}`} className="font-normal cursor-pointer">
                          {recurso.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.resources && (
                    <p className="text-sm text-red-600">{errors.resources.message}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting || loading}>
                  {(isSubmitting || loading) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {(isSubmitting || loading) ? 'Salvando...' : (isEdicao ? 'Atualizar' : 'Cadastrar')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/salas')}
                  disabled={isSubmitting || loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={isEdicao ? "Atualizar Sala" : "Cadastrar Sala"}
        description={isEdicao
          ? "Tem certeza que deseja atualizar esta sala?"
          : "Tem certeza que deseja cadastrar esta sala?"
        }
        type={isEdicao ? "edit" : "confirm"}
        onConfirm={handleConfirmSave}
        loading={loading}
      />
    </div>
  )
}
