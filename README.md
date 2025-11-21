# Sistema de Reserva de Salas de Reunião

Sistema web completo para gerenciamento e reserva de salas de reunião, desenvolvido com React 19, TypeScript, Vite e shadcn/ui. Interface moderna e responsiva com foco em usabilidade e experiência do usuário.

## 📋 Índice

- [Tecnologias](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando o Projeto](#-executando-o-projeto)
  - [Modo Desenvolvimento Local](#modo-desenvolvimento-local)
  - [Com Docker (Desenvolvimento)](#com-docker-desenvolvimento)
  - [Com Docker (Produção)](#com-docker-produção)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas da Aplicação](#-rotas-da-aplicação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Build para Produção](#-build-para-produção)
- [Licença](#-licença)

## 🚀 Tecnologias Utilizadas

### Core
- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset tipado de JavaScript
- **Vite 7.2.2** - Build tool e dev server de alta performance
- **React Router DOM 7.9.6** - Roteamento do lado do cliente

### UI/UX
- **shadcn/ui** - Biblioteca de componentes acessíveis e customizáveis
- **Radix UI** - Primitivos de UI headless e acessíveis
- **Tailwind CSS 4.1.17** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones moderna

### Formulários e Validação
- **React Hook Form 7.66.1** - Gerenciamento performático de formulários
- **Zod 4.1.12** - Schema validation TypeScript-first
- **@hookform/resolvers 5.2.2** - Integração entre React Hook Form e Zod

### Comunicação com API
- **Axios 1.13.2** - Cliente HTTP com interceptors para JWT

### Outras Dependências
- **date-fns 4.1.0** - Manipulação de datas
- **react-day-picker 9.11.1** - Componente de calendário

## 📋 Funcionalidades

### Sistema de Autenticação e Autorização

#### 3 Perfis de Usuário:

1. **Admin** - Acesso completo ao sistema
   - Gerenciamento de usuários
   - Todas as funcionalidades de Manager

2. **Manager** - Gerenciamento operacional
   - Cadastro de localizações, salas e recursos
   - Aprovação/rejeição de reservas
   - Visualização de todas as reservas

3. **User** - Usuário comum
   - Visualização de salas disponíveis
   - Criação e gerenciamento de reservas próprias
   - Visualização de histórico

### Módulos do Sistema

#### 🔐 Autenticação
- Login com email e senha
- Registro de novos usuários
- Autenticação JWT (access + refresh tokens)
- Renovação automática de tokens
- Gerenciamento de sessões
- Alteração de senha
- Atualização de perfil

#### 🏢 Gestão de Localizações
- Cadastro de localizações (prédios, andares, etc)
- Informações: nome, endereço completo, CEP, cidade, estado
- Listagem com paginação e busca
- Edição e exclusão (soft delete)
- Validação de CEP brasileiro

#### 🚪 Gestão de Salas
- Cadastro de salas com capacidade (1-500 pessoas)
- Associação a localização
- Vinculação de recursos disponíveis
- Listagem com filtros e busca
- Visualização de disponibilidade
- Edição e exclusão

#### 🖥️ Gestão de Recursos
- Cadastro de recursos (equipamentos, materiais)
- Descrição detalhada
- Controle de status (ativo/inativo)
- Listagem e edição

#### 📅 Sistema de Reservas
- Criação de reservas com:
  - Data e horário (início e fim)
  - Sala desejada
  - Opção de coffee break com número de pessoas
  - Observações
- Validações:
  - Não permite reservas em datas passadas
  - Horário de fim maior que início
  - Verificação de disponibilidade
- Estados da reserva: Pendente → Confirmada → Concluída/Cancelada
- Para Usuários:
  - Cards expandíveis com detalhes completos
  - Visualização de informações da sala (capacidade, recursos)
  - Detalhes da localização (endereço, cidade)
  - Duração formatada da reserva
  - Informações de confirmação/cancelamento
  - Histórico completo
- Para Managers:
  - Tabela com visão geral de todas as reservas
  - Aprovação rápida de reservas pendentes
  - Rejeição com justificativa
  - Informações de contato do solicitante

#### 👥 Gestão de Usuários (Admin)
- Listagem de usuários do sistema
- Criação de novos usuários
- Edição de dados e permissões
- Controle de status (ativo/inativo)

## 🔧 Pré-requisitos

### Desenvolvimento Local
- **Node.js** versão 18.x ou superior
- **npm** versão 9.x ou superior (ou yarn/pnpm)

### Com Docker
- **Docker** versão 20.x ou superior
- **Docker Compose** versão 2.x ou superior

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-reserva-salas-api
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API backend:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🚀 Executando o Projeto

### Modo Desenvolvimento Local

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

> **Nota:** Se a porta 5173 estiver em uso, o Vite automaticamente escolherá outra porta. Verifique a saída no terminal.

### Com Docker (Desenvolvimento)

Ideal para desenvolvimento com hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

A aplicação estará disponível em: **http://localhost:5173**

Para parar:
```bash
docker-compose -f docker-compose.dev.yml down
```

### Com Docker (Produção)

Build otimizado com Nginx:

```bash
docker-compose up -d
```

A aplicação estará disponível em: **http://localhost:3000**

Para parar:
```bash
docker-compose down
```

Para rebuild após alterações:
```bash
docker-compose up -d --build
```

## 📁 Estrutura do Projeto

```
sistema-reserva-salas-api/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes shadcn/ui (20 componentes)
│   │   ├── Layout.tsx      # Layout principal com sidebar
│   │   └── ProtectedRoute.tsx  # Guard de rotas autenticadas
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── lib/                # Utilitários
│   │   └── utils.ts        # Funções helper (cn, etc)
│   ├── pages/              # Páginas da aplicação (14 páginas)
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── ListaSalas.tsx
│   │   ├── FormularioSala.tsx
│   │   ├── ListaLocalizacoes.tsx
│   │   ├── FormularioLocalizacao.tsx
│   │   ├── ListaRecursos.tsx
│   │   ├── FormularioRecurso.tsx
│   │   ├── ListaUsuarios.tsx
│   │   ├── FormularioUsuario.tsx
│   │   ├── ReservaSala.tsx
│   │   ├── EditarReserva.tsx
│   │   └── MinhasReservas.tsx
│   ├── services/           # Camada de serviços API
│   │   ├── api.ts          # Configuração Axios + interceptors
│   │   ├── authService.ts  # Autenticação
│   │   ├── userService.ts  # Usuários
│   │   ├── roomService.ts  # Salas
│   │   ├── resourceService.ts  # Recursos
│   │   ├── locationService.ts  # Localizações
│   │   └── bookingService.ts   # Reservas
│   ├── types/              # Definições TypeScript
│   │   └── index.ts        # Tipos e schemas Zod (456 linhas)
│   ├── App.tsx             # Configuração de rotas
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais Tailwind
├── public/                 # Assets estáticos
├── Dockerfile              # Build multi-stage para produção
├── Dockerfile.dev          # Dockerfile para desenvolvimento
├── docker-compose.yml      # Compose para produção
├── docker-compose.dev.yml  # Compose para desenvolvimento
├── nginx.conf              # Configuração Nginx
├── .dockerignore          # Arquivos ignorados no build Docker
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
├── vite.config.ts         # Configuração Vite
└── tailwind.config.js     # Configuração Tailwind
```

## 🗺️ Rotas da Aplicação

### Rotas Públicas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Login | Página de login |
| `/login` | Login | Alias para login |
| `/register` | Register | Registro de usuários |

### Rotas Autenticadas (Todos)
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/profile` | Profile | Perfil do usuário |
| `/reservas/nova` | ReservaSala | Criar nova reserva |
| `/reservas/editar/:id` | EditarReserva | Editar reserva |
| `/minhas-reservas` | MinhasReservas | Minhas reservas |

### Rotas Admin + Manager
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/salas` | ListaSalas | Listar salas |
| `/salas/nova` | FormularioSala | Criar sala |
| `/salas/editar/:id` | FormularioSala | Editar sala |
| `/localizacoes` | ListaLocalizacoes | Listar localizações |
| `/localizacoes/nova` | FormularioLocalizacao | Criar localização |
| `/localizacoes/editar/:id` | FormularioLocalizacao | Editar localização |
| `/recursos` | ListaRecursos | Listar recursos |
| `/recursos/novo` | FormularioRecurso | Criar recurso |
| `/recursos/editar/:id` | FormularioRecurso | Editar recurso |

### Rotas Admin Apenas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/usuarios` | ListaUsuarios | Listar usuários |
| `/usuarios/novo` | FormularioUsuario | Criar usuário |
| `/usuarios/editar/:id` | FormularioUsuario | Editar usuário |

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL da API Backend (obrigatório)
VITE_API_BASE_URL=http://localhost:8000/api
```

> **Importante:** Todas as variáveis de ambiente no Vite devem começar com `VITE_` para serem expostas ao cliente.

## 🏗️ Build para Produção

### Build Local
```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`

### Preview do Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 🎨 Características do Design

- ✅ **Interface Moderna**: Design limpo e profissional
- ✅ **Responsivo**: Funciona em desktop, tablet e mobile
- ✅ **Acessível**: Componentes seguem WCAG com Radix UI
- ✅ **Consistente**: Design system com shadcn/ui
- ✅ **Performático**: React 19 + Vite para builds rápidos
- ✅ **Type-Safe**: TypeScript em 100% do código
- ✅ **Validação Robusta**: Zod schemas para todos os formulários

## 🔄 Integração com Backend

O frontend espera um backend Django REST Framework com os seguintes endpoints:

```
Base URL: {VITE_API_BASE_URL}

POST   /token/              - Login (JWT)
POST   /token/refresh/      - Refresh token
POST   /users/register/     - Registro
GET    /users/me/           - Perfil atual
GET    /location/           - Listar localizações
GET    /resource/           - Listar recursos
GET    /room/               - Listar salas
GET    /booking/            - Listar reservas
POST   /booking/            - Criar reserva
POST   /booking/{id}/confirm/  - Confirmar reserva
POST   /booking/{id}/cancel/   - Cancelar reserva
```

Consulte a documentação completa da API em `GUIA-API.md`.

## 📝 Documentação Adicional

- **GUIA-API.md** - Documentação completa dos endpoints da API
- **INTEGRACAO-API.md** - Guia de integração com o backend
- **README-TYPESCRIPT.md** - Guia de conversão e uso do TypeScript
- **BACKEND-FIX-REQUIRED.md** - Issues conhecidas do backend

## 🐛 Troubleshooting

### Porta em uso
Se a porta padrão estiver em uso:
```bash
# Matar processo na porta 5173 (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Ou use uma porta específica
npm run dev -- --port 3000
```

### Erro de conexão com API
Verifique se:
1. A variável `VITE_API_BASE_URL` está configurada corretamente
2. O backend está rodando
3. Não há problemas de CORS

### Problemas com Docker
```bash
# Limpar cache do Docker
docker-compose down -v
docker system prune -a

# Rebuild completo
docker-compose up --build --force-recreate
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido com

- ❤️ React 19 & TypeScript
- ⚡ Vite
- 🎨 shadcn/ui & Tailwind CSS
- 🔐 JWT Authentication
- 🐳 Docker

---

**Nota:** Este é o frontend da aplicação. O backend Django REST Framework deve ser configurado separadamente.
