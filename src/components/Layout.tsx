import { ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Package, Calendar, LogOut, Menu, X, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface LayoutProps {
  children: ReactNode
}

interface MenuItem {
  nome: string
  icon: React.ElementType
  path: string
  roles: UserRole[]
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)

  const userRole = user?.role || 'user'

  const menuItems: MenuItem[] = [
    {
      nome: 'Salas',
      icon: Building2,
      path: '/salas',
      roles: ['admin', 'manager']
    },
    {
      nome: 'Localizações',
      icon: MapPin,
      path: '/localizacoes',
      roles: ['admin', 'manager']
    },
    {
      nome: 'Recursos',
      icon: Package,
      path: '/recursos',
      roles: ['admin', 'manager']
    },
    {
      nome: 'Usuários',
      icon: Users,
      path: '/usuarios',
      roles: ['admin']
    },
    {
      nome: userRole === 'user' ? 'Minhas Reservas' : 'Gerenciar Reservas',
      icon: Calendar,
      path: '/minhas-reservas',
      roles: ['admin', 'manager', 'user']
    },
    {
      nome: 'Perfil',
      icon: User,
      path: '/profile',
      roles: ['admin', 'manager', 'user']
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, redirecionar para login
      navigate('/login')
    }
  }

  const menuFiltrado = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Sistema de Salas</h1>
              <p className="text-xs text-gray-500">Gestão de Reuniões</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuFiltrado.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.nome}
              </Button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Perfil</p>
            <p className="text-sm font-medium capitalize">{userRole}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold">Sistema de Salas</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {menuAberto && (
          <nav className="border-t border-gray-200 p-4 space-y-2">
            {menuFiltrado.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.path)
                    setMenuAberto(false)
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.nome}
                </Button>
              )
            })}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="mb-3 px-2">
                <p className="text-xs text-gray-500">Perfil</p>
                <p className="text-sm font-medium capitalize">{userRole}</p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
