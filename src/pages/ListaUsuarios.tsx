import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Users, Search, Plus, Edit, Trash2, Loader2, Mail, Phone } from 'lucide-react'
import { userService } from '@/services'
import type { UserAPI } from '@/types'

export default function ListaUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<UserAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const response = await userService.list()
      setUsuarios(response.results)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    try {
      setLoading(true)
      const response = await userService.list({ search: term })
      setUsuarios(response.results)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      setDeleteLoading(true)
      await userService.delete(deleteId)
      await fetchUsuarios()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      alert('Erro ao deletar usuário. Tente novamente.')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-600">Admin</Badge>
      case 'manager':
        return <Badge variant="default" className="bg-blue-600">Manager</Badge>
      case 'user':
        return <Badge variant="secondary">Usuário</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-600">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  const usuarioSelecionado = deleteId ? usuarios.find(u => u.id === deleteId) : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-1">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={() => navigate('/usuarios/novo')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {usuarios.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {usuarios.filter(u => u.role === 'manager').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {usuarios.filter(u => u.role === 'user').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Busca */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabela */}
            {usuarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Tente buscar por outro termo' : 'Comece cadastrando um novo usuário'}
                </p>
                <Button onClick={() => navigate('/usuarios/novo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email / Username</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.first_name || usuario.last_name ? `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim() : '-'}</p>
                          <p className="text-sm text-gray-500">ID: {usuario.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{usuario.email}</span>
                          </div>
                          <p className="text-xs text-gray-500">@{usuario.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{usuario.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                      <TableCell>{getStatusBadge(usuario.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(usuario.id!)}
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
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
        title="Deletar Usuário"
        description={`Tem certeza que deseja deletar o usuário "${usuarioSelecionado?.username}"? Esta ação não pode ser desfeita.`}
        type="delete"
        confirmText="Deletar Usuário"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  )
}
