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
import { locationService } from '@/services'
import { localizacaoSchema, type LocalizacaoFormData, type LocationAPI } from '@/types'

export default function FormularioLocalizacao() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdicao = !!id
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [formData, setFormData] = useState<LocalizacaoFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm<LocalizacaoFormData>({
    resolver: zodResolver(localizacaoSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      descricao: ''
    }
  })

  // Carrega dados para edição
  useEffect(() => {
    if (isEdicao && id) {
      const fetchLocation = async () => {
        try {
          setLoadingData(true)
          const data = await locationService.getById(Number(id))
          // Mapeia API → Frontend
          reset({
            nome: data.name,
            endereco: data.address,
            cidade: data.city,
            estado: data.state,
            cep: data.cep,
            descricao: data.description || ''
          })
        } catch (error) {
          console.error('Erro ao carregar localização:', error)
          alert('Erro ao carregar localização. Tente novamente.')
          navigate('/localizacoes')
        } finally {
          setLoadingData(false)
        }
      }
      fetchLocation()
    }
  }, [id, isEdicao, reset, navigate])

  const onSubmit = async (data: LocalizacaoFormData) => {
    setFormData(data)
    setConfirmDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!formData) return

    try {
      setLoading(true)

      // Mapeia Frontend → API
      const apiData: Omit<LocationAPI, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.nome,
        address: formData.endereco,
        city: formData.cidade,
        state: formData.estado,
        cep: formData.cep, // CEP já formatado
        description: formData.descricao || undefined
      }

      if (isEdicao && id) {
        await locationService.update(Number(id), apiData)
      } else {
        await locationService.create(apiData)
      }

      setConfirmDialogOpen(false)
      navigate('/localizacoes')
    } catch (error) {
      console.error('Erro ao salvar localização:', error)
      alert('Erro ao salvar localização. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para formatar CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8)
    }
    setValue('cep', value)
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando localização...</p>
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
            onClick={() => navigate('/localizacoes')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdicao ? 'Editar Localização' : 'Nova Localização'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdicao ? 'Atualize as informações da localização' : 'Cadastre uma nova localização'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Localização</CardTitle>
            <CardDescription>
              Preencha os dados da localização onde as salas estão localizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Localização *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Prédio A - 1º Andar"
                  {...register('nome')}
                  aria-invalid={errors.nome ? 'true' : 'false'}
                />
                {errors.nome && (
                  <p className="text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  placeholder="Ex: Rua Principal, 100"
                  {...register('endereco')}
                  aria-invalid={errors.endereco ? 'true' : 'false'}
                />
                {errors.endereco && (
                  <p className="text-sm text-red-600">{errors.endereco.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo"
                    {...register('cidade')}
                    aria-invalid={errors.cidade ? 'true' : 'false'}
                  />
                  {errors.cidade && (
                    <p className="text-sm text-red-600">{errors.cidade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    placeholder="Ex: SP"
                    maxLength={2}
                    {...register('estado')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setValue('estado', value)
                    }}
                    aria-invalid={errors.estado ? 'true' : 'false'}
                  />
                  {errors.estado && (
                    <p className="text-sm text-red-600">{errors.estado.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    maxLength={9}
                    {...register('cep')}
                    onChange={handleCepChange}
                    aria-invalid={errors.cep ? 'true' : 'false'}
                  />
                  {errors.cep && (
                    <p className="text-sm text-red-600">{errors.cep.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Informações adicionais sobre a localização..."
                  {...register('descricao')}
                  rows={4}
                  aria-invalid={errors.descricao ? 'true' : 'false'}
                />
                {errors.descricao && (
                  <p className="text-sm text-red-600">{errors.descricao.message}</p>
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
                  onClick={() => navigate('/localizacoes')}
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
        title={isEdicao ? "Atualizar Localização" : "Cadastrar Localização"}
        description={isEdicao
          ? "Tem certeza que deseja atualizar esta localização?"
          : "Tem certeza que deseja cadastrar esta localização?"
        }
        type={isEdicao ? "edit" : "confirm"}
        onConfirm={handleConfirmSave}
        loading={loading}
      />
    </div>
  )
}
