import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MapPin, Users, Monitor, Plus, Loader2, Trash2 } from 'lucide-react'
import { roomService, locationService, resourceService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { RoomAPI, LocationAPI, ResourceAPI } from '@/types'

interface Filtros {
  search: string
  capacidade: string
}

export default function ListaSalas() {
  const navigate = useNavigate()
  const { isAdminOrManager } = useAuth()
  const [salas, setSalas] = useState<RoomAPI[]>([])
  const [localizacoes, setLocalizacoes] = useState<LocationAPI[]>([])
  const [recursos, setRecursos] = useState<ResourceAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({
    search: '',
    capacidade: ''
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Carrega dados da API
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [salasRes, localizacoesRes, recursosRes] = await Promise.all([
        roomService.list({ search: filtros.search || undefined }),
        locationService.list(),
        resourceService.list()
      ])

      setSalas(salasRes.results)
      setLocalizacoes(localizacoesRes.results)
      setRecursos(recursosRes.results)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar salas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Busca nome da localização pelo ID
  const getLocationName = (locationId: number): string => {
    const location = localizacoes.find(l => l.id === locationId)
    return location?.name || 'Localização não encontrada'
  }

  // Busca nomes dos recursos pelos IDs
  const getResourceNames = (resourceIds: number[]): string[] => {
    return resourceIds
      .map(id => recursos.find(r => r.id === id)?.name)
      .filter((name): name is string => !!name)
  }

  // Filtra salas por capacidade
  const salasFiltradas = salas.filter(sala => {
    if (filtros.capacidade && sala.capacity < parseInt(filtros.capacidade)) {
      return false
    }
    return true
  })

  const handleDeleteClick = (id: number): void => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteId) return

    try {
      setDeleteLoading(true)
      await roomService.delete(deleteId)
      setSalas(prev => prev.filter(s => s.id !== deleteId))
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error('Erro ao deletar sala:', err)
      alert('Erro ao deletar sala. Tente novamente.')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando salas...</p>
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
              <Button onClick={fetchData}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salas Disponíveis</h1>
            <p className="text-gray-600 mt-1">Encontre a sala perfeita para sua reunião</p>
          </div>
          {isAdminOrManager() && (
            <Button onClick={() => navigate('/salas/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sala
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine sua busca por salas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nome da sala..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade Mínima</Label>
                <Input
                  id="capacidade"
                  type="number"
                  placeholder="Ex: 10"
                  value={filtros.capacidade}
                  onChange={(e) => setFiltros({ ...filtros, capacidade: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Salas */}
        {salasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                Nenhuma sala encontrada.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salasFiltradas.map((sala) => (
              <Card key={sala.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{sala.name}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getLocationName(sala.location)}
                      </CardDescription>
                    </div>
                    <Badge variant={sala.is_active !== false ? "default" : "destructive"}>
                      {sala.is_active !== false ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacidade: {sala.capacity} pessoas
                    </div>

                    {sala.resources && sala.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recursos:</p>
                        <div className="flex flex-wrap gap-2">
                          {getResourceNames(sala.resources).map((recurso, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {recurso}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAdminOrManager() && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/salas/editar/${sala.id}`)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(sala.id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Sala"
        description="Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
        type="delete"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  )
}
