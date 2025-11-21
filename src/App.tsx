import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ListaSalas from './pages/ListaSalas'
import FormularioSala from './pages/FormularioSala'
import ListaLocalizacoes from './pages/ListaLocalizacoes'
import FormularioLocalizacao from './pages/FormularioLocalizacao'
import ListaRecursos from './pages/ListaRecursos'
import FormularioRecurso from './pages/FormularioRecurso'
import ListaUsuarios from './pages/ListaUsuarios'
import FormularioUsuario from './pages/FormularioUsuario'
import ReservaSala from './pages/ReservaSala'
import EditarReserva from './pages/EditarReserva'
import MinhasReservas from './pages/MinhasReservas'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas - Todos os usuários autenticados */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/salas" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <ListaSalas />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reservas/nova" element={
            <ProtectedRoute>
              <Layout>
                <ReservaSala />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reservas/editar/:id" element={
            <ProtectedRoute>
              <Layout>
                <EditarReserva />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/minhas-reservas" element={
            <ProtectedRoute>
              <Layout>
                <MinhasReservas />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rotas protegidas - Admin e Manager apenas */}
          <Route path="/salas/nova" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioSala />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/salas/editar/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioSala />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/localizacoes" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <ListaLocalizacoes />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/localizacoes/nova" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioLocalizacao />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/localizacoes/editar/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioLocalizacao />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/recursos" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <ListaRecursos />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/recursos/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioRecurso />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/recursos/editar/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Layout>
                <FormularioRecurso />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rotas de Usuários - Apenas Admin */}
          <Route path="/usuarios" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <ListaUsuarios />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/usuarios/novo" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <FormularioUsuario />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/usuarios/editar/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <FormularioUsuario />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Rota padrão - redireciona para login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
