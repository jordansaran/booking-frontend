import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Edit, Trash2, Monitor, Loader2 } from 'lucide-react'
import { resourceService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import type { ResourceAPI } from '@/types'

export default function ListaRecursos() {
  const navigate = useNavigate()
  const { isAdminOrManager } = useAuth()
  const [recursos, setRecursos] = useState<ResourceAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Carrega os recursos da API
  const fetchRecursos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await resourceService.list()
      setRecursos(response.results)
    } catch (err) {
      console.error('Erro ao carregar recursos:', err)
      setError('Erro ao carregar recursos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecursos()
  }, [])

  const handleDeleteClick = (id: number): void => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteId) return

    try {
      setDeleteLoading(true)
      await resourceService.delete(deleteId)
      setRecursos(prev => prev.filter(r => r.id !== deleteId))
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error('Erro ao deletar recurso:', err)
      alert('Erro ao deletar recurso. Tente novamente.')
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
          <p className="text-gray-600">Carregando recursos...</p>
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
              <Button onClick={fetchRecursos}>Tentar novamente</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
            <p className="text-gray-600 mt-1">Gerencie os recursos disponíveis nas salas</p>
          </div>
          {isAdminOrManager() && (
            <Button onClick={() => navigate('/recursos/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Recurso
            </Button>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Recursos</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recursos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recursos Ativos</CardTitle>
              <Monitor className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {recursos.filter(r => r.is_active !== false).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Recursos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Recursos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os recursos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recursos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum recurso cadastrado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    {isAdminOrManager() && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recursos.map((recurso) => (
                    <TableRow key={recurso.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-primary" />
                          {recurso.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">{recurso.description}</TableCell>
                      {isAdminOrManager() && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/recursos/editar/${recurso.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(recurso.id!)}
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
        title="Excluir Recurso"
        description="Tem certeza que deseja excluir este recurso? Esta ação não pode ser desfeita."
        type="delete"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  )
}
