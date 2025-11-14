# 🍕 ePizza Marketplace

> Plataforma moderna de marketplace de pizzarias com suporte multi-vendor, painel administrativo e rastreamento em tempo real de pedidos.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/eloviskis/Epizza-V2)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Docker](#docker)
- [API Documentation](#api-documentation)
- [Deploy em Produção](#deploy-em-produção)

## 🎯 Sobre o Projeto

O **ePizza Marketplace** é uma plataforma completa que conecta pizzarias com clientes, oferecendo:

- **Para Clientes**: Navegação intuitiva, customização de pizzas, rastreamento em tempo real
- **Para Donos de Pizzaria**: Dashboard Kanban, gerenciamento de cardápio e mesas
- **Para Administradores**: Controle total sobre pizzarias e sistema

### ✨ Destaques

- 🔐 **Segurança robusta** com JWT, bcrypt, helmet e rate limiting
- 🚀 **Performance otimizada** com React 19 e Vite 6
- 🐳 **Docker-ready** para deploy simplificado
- 📱 **Responsive design** para mobile e desktop
- 🎨 **UI moderna** com Tailwind CSS
- 🔄 **Real-time updates** para status de pedidos

## 🚀 Funcionalidades

### Cliente
✅ Visualização de pizzarias • ✅ Cardápio interativo • ✅ Customização de pizzas • ✅ Carrinho inteligente • ✅ Rastreamento em tempo real

### Dono de Pizzaria
✅ Kitchen Kanban • ✅ Menu Manager • ✅ Table Manager • ✅ Dashboard de métricas

### Administrador
✅ Gerenciamento de pizzarias • ✅ Controle de ativação • ✅ Visão global

## 🛠️ Tecnologias

**Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS
**Backend:** Node.js, Express, JWT, bcrypt
**Database:** PostgreSQL, Sequelize
**DevOps:** Docker, Docker Compose, Nginx, Redis

## 📦 Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** (opcional)

## 🔧 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/eloviskis/Epizza-V2.git
cd Epizza-V2

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Inicie o projeto
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

Acesse: **http://localhost:3000**

## 🐳 Docker

```bash
# Subir todos os serviços (Frontend + Backend + PostgreSQL + Redis)
npm run docker:up

# Ver logs
npm run docker:logs

# Parar serviços
npm run docker:down
```

Serviços:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📚 API Documentation

### Credenciais de Teste

```
Cliente:        cliente@email.com / 123
Dono:          dono@bella.com / 123
Administrador: admin@epizza.com / 123
```

### Endpoints Principais

```
POST   /api/login                                # Login
POST   /api/register                             # Registro
GET    /api/pizzerias                            # Listar pizzarias
GET    /api/orders                               # Listar pedidos
POST   /api/orders                               # Criar pedido
PATCH  /api/orders/:id/status                    # Atualizar status (Owner)
```

## 🚀 Deploy em Produção

### Docker (Recomendado)

```bash
# 1. Configure .env com valores de produção
cp .env.example .env

# 2. Build e deploy
npm run docker:build
docker-compose up -d
```

### Manual

```bash
npm run build
npm run prod:start
```

## 📊 Scripts Disponíveis

```bash
npm run dev              # Dev frontend
npm run dev:server       # Dev backend
npm run build            # Build produção
npm run lint             # ESLint
npm run format           # Prettier
npm run docker:up        # Docker up
npm run prod:start       # Produção
```

## 🔒 Segurança

✅ JWT Authentication • ✅ Bcrypt • ✅ Helmet • ✅ Rate Limiting • ✅ Input Validation • ✅ CORS

## 📁 Estrutura

```
Epizza-V2/
├── components/           # Componentes React
├── pages/               # Páginas
├── context/             # Context API
├── scripts/             # Scripts
├── server.improved.js   # Backend seguro
├── Dockerfile
└── docker-compose.yml
```

## 🐛 Troubleshooting

**Porta em uso:** Mude `PORT` no `.env`
**Problemas Docker:** `docker-compose down -v && docker system prune -a`
**Erro dependências:** `rm -rf node_modules && npm install`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja [LICENSE](LICENSE)

---

**Desenvolvido com ❤️ e 🍕 pela equipe ePizza**
