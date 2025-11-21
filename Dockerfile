# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (usa npm ci se houver lock file, senão npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
