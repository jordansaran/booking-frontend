import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { resourceService } from '@/services'
import { recursoSchema, type RecursoFormData, type ResourceAPI } from '@/types'

export default function FormularioRecurso() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdicao = !!id
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RecursoFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RecursoFormData>({
    resolver: zodResolver(recursoSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  // Carrega dados para edição
  useEffect(() => {
    if (isEdicao && id) {
      const fetchResource = async () => {
        try {
          setLoadingData(true)
          const data = await resourceService.getById(Number(id))
          reset({
            name: data.name,
            description: data.description
          })
        } catch (error) {
          console.error('Erro ao carregar recurso:', error)
          alert('Erro ao carregar recurso. Tente novamente.')
          navigate('/recursos')
        } finally {
          setLoadingData(false)
        }
      }
      fetchResource()
    }
  }, [id, isEdicao, reset, navigate])

  const onSubmit = async (data: RecursoFormData) => {
    setFormData(data)
    setConfirmDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!formData) return

    try {
      setLoading(true)

      const apiData: Omit<ResourceAPI, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        description: formData.description
      }

      if (isEdicao && id) {
        await resourceService.update(Number(id), apiData)
      } else {
        await resourceService.create(apiData)
      }

      setConfirmDialogOpen(false)
      navigate('/recursos')
    } catch (error) {
      console.error('Erro ao salvar recurso:', error)
      alert('Erro ao salvar recurso. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando recurso...</p>
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
            onClick={() => navigate('/recursos')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdicao ? 'Editar Recurso' : 'Novo Recurso'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdicao ? 'Atualize as informações do recurso' : 'Cadastre um novo recurso'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Recurso</CardTitle>
            <CardDescription>
              Preencha os dados do recurso disponível nas salas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Recurso *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Projetor, TV, Quadro Branco"
                  {...register('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o recurso, suas características e especificações..."
                  {...register('description')}
                  rows={4}
                  aria-invalid={errors.description ? 'true' : 'false'}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

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
                  onClick={() => navigate('/recursos')}
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
        title={isEdicao ? "Atualizar Recurso" : "Cadastrar Recurso"}
        description={isEdicao
          ? "Tem certeza que deseja atualizar este recurso?"
          : "Tem certeza que deseja cadastrar este recurso?"
        }
        type={isEdicao ? "edit" : "confirm"}
        onConfirm={handleConfirmSave}
        loading={loading}
      />
    </div>
  )
}
