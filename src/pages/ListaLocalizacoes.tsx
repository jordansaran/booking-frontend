import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MapPin, Plus, Edit, Trash2, Building2, Loader2 } from 'lucide-react'
import { locationService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { Localizacao, LocationAPI } from '@/types'

export default function ListaLocalizacoes() {
  const navigate = useNavigate()
  const { isAdminOrManager } = useAuth()
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Mapeia dados da API para o formato do frontend
  const mapApiToFrontend = (apiData: LocationAPI): Localizacao => ({
    id: apiData.id!,
    nome: apiData.name,
    endereco: apiData.address,
    cidade: apiData.city,
    estado: apiData.state,
    cep: apiData.cep,
    descricao: apiData.description,
    // Esses campos viriam de um endpoint específico ou agregação
    salasTotal: 0,
    salasDisponiveis: 0
  })

  // Carrega as localizações da API
  const fetchLocalizacoes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await locationService.list()
      const mappedData = response.results.map(mapApiToFrontend)
      setLocalizacoes(mappedData)
    } catch (err) {
      console.error('Erro ao carregar localizações:', err)
      setError('Erro ao carregar localizações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocalizacoes()
  }, [])

  const handleDeleteClick = (id: number): void => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteId) return

    try {
      setDeleteLoading(true)
      await locationService.delete(deleteId)
      setLocalizacoes(prev => prev.filter(loc => loc.id !== deleteId))
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error('Erro ao deletar localização:', err)
      alert('Erro ao deletar localização. Tente novamente.')
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
          <p className="text-gray-600">Carregando localizações...</p>
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
              <Button onClick={fetchLocalizacoes}>Tentar novamente</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Localizações</h1>
            <p className="text-gray-600 mt-1">Gerencie as localizações das salas de reunião</p>
          </div>
          {isAdminOrManager() && (
            <Button onClick={() => navigate('/localizacoes/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Localização
            </Button>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Localizações</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localizacoes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Salas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {localizacoes.reduce((acc, loc) => acc + (loc.salasTotal || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas Disponíveis</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {localizacoes.reduce((acc, loc) => acc + (loc.salasDisponiveis || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Localizações */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Localizações</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as localizações cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {localizacoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma localização cadastrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>CEP</TableHead>
                    {isAdminOrManager() && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localizacoes.map((localizacao) => (
                    <TableRow key={localizacao.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {localizacao.nome}
                        </div>
                      </TableCell>
                      <TableCell>{localizacao.endereco}</TableCell>
                      <TableCell>{localizacao.cidade}</TableCell>
                      <TableCell>{localizacao.estado}</TableCell>
                      <TableCell>{localizacao.cep}</TableCell>
                      {isAdminOrManager() && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/localizacoes/editar/${localizacao.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(localizacao.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Localização"
        description="Tem certeza que deseja excluir esta localização? Esta ação não pode ser desfeita."
        type="delete"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  )
}
