# 🚀 Guia de Deploy - ePizza Marketplace

Este guia fornece instruções detalhadas para fazer deploy do ePizza Marketplace em diferentes ambientes de produção.

## 📋 Sumário

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy com Docker](#deploy-com-docker)
3. [Deploy em VPS (AWS, DigitalOcean, etc)](#deploy-em-vps)
4. [Deploy no Vercel + Railway](#deploy-no-vercel--railway)
5. [Configurações de Segurança](#configurações-de-segurança)
6. [Monitoramento](#monitoramento)
7. [Backup e Restauração](#backup-e-restauração)

---

## 🔧 Pré-requisitos

Antes de começar o deploy, certifique-se de ter:

- [ ] Domínio configurado (opcional, mas recomendado)
- [ ] Certificado SSL (Let's Encrypt recomendado)
- [ ] Servidor com pelo menos 2GB RAM e 20GB disco
- [ ] Docker e Docker Compose instalados (para deploy com Docker)
- [ ] Variáveis de ambiente configuradas

---

## 🐳 Deploy com Docker

### Passo 1: Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Passo 2: Clonar o Repositório

```bash
git clone https://github.com/eloviskis/Epizza-V2.git
cd Epizza-V2
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

Edite com valores de produção:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-dominio.com

# JWT - IMPORTANTE: Gere uma chave segura!
JWT_SECRET=sua-chave-super-secreta-e-longa-aqui
JWT_EXPIRES_IN=7d

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=epizza_db
DB_USER=postgres
DB_PASSWORD=senha-super-forte-aqui

# CORS
CORS_ORIGIN=https://seu-dominio.com
```

### Passo 4: Build e Deploy

```bash
# Build da imagem
docker build -t epizza-marketplace .

# Subir containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Passo 5: Configurar Nginx Reverse Proxy

Crie `/etc/nginx/sites-available/epizza`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/epizza /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 6: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

---

## 🖥️ Deploy em VPS

### AWS EC2

1. **Criar instância EC2**
   - AMI: Ubuntu 22.04 LTS
   - Tipo: t2.medium (2vCPU, 4GB RAM)
   - Storage: 30GB GP3
   - Security Group: Portas 22, 80, 443

2. **Conectar via SSH**
   ```bash
   ssh -i sua-chave.pem ubuntu@ip-do-servidor
   ```

3. **Seguir passos do [Deploy com Docker](#deploy-com-docker)**

### DigitalOcean

1. **Criar Droplet**
   - Imagem: Docker on Ubuntu 22.04
   - Plan: Basic - 2GB RAM / 50GB SSD
   - Datacenter: Escolher mais próximo

2. **SSH e Deploy**
   ```bash
   ssh root@ip-do-droplet
   # Seguir passos do Deploy com Docker
   ```

---

## ☁️ Deploy no Vercel + Railway

### Frontend no Vercel

1. **Conectar repositório no Vercel**
   - https://vercel.com/new
   - Importar repositório GitHub

2. **Configurar Build**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Variáveis de Ambiente**
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```

### Backend no Railway

1. **Criar novo projeto no Railway**
   - https://railway.app/new

2. **Adicionar PostgreSQL**
   - New → Database → PostgreSQL

3. **Deploy do Backend**
   - New → GitHub Repo → Selecionar repositório

4. **Configurar Variáveis**
   ```
   NODE_ENV=production
   JWT_SECRET=sua-chave-secreta
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=3001
   ```

5. **Configurar Start Command**
   ```
   node server.improved.js
   ```

---

## 🔒 Configurações de Segurança

### 1. Firewall

```bash
# Ubuntu/Debian com UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban (Proteção contra força bruta)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Atualizar JWT Secret

```bash
# Gerar chave segura
openssl rand -base64 64

# Atualizar no .env
JWT_SECRET=sua-nova-chave-aqui
```

### 4. Configurar HTTPS-only

No `.env`:
```env
NODE_ENV=production
FORCE_HTTPS=true
```

### 5. Rate Limiting

Já configurado no `server.improved.js`:
- Login: 5 requisições por 15 minutos
- API geral: 100 requisições por 15 minutos

---

## 📊 Monitoramento

### Health Checks

```bash
# Verificar se API está online
curl https://seu-dominio.com/api/health

# Resposta esperada:
# {"status":"healthy","timestamp":"2025-01-14T...","uptime":12345}
```

### Logs

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do frontend
docker-compose logs -f frontend

# Ver logs do banco
docker-compose logs -f postgres
```

### Monitoramento com PM2 (alternativa ao Docker)

```bash
npm install -g pm2

# Iniciar aplicação
pm2 start server.improved.js --name epizza-api
pm2 start "npm run dev" --name epizza-frontend

# Monitorar
pm2 monit

# Logs
pm2 logs

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## 💾 Backup e Restauração

### Backup do Banco de Dados

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres epizza_db > backup_$(date +%Y%m%d).sql

# Backup automático diário (crontab)
0 2 * * * docker-compose exec postgres pg_dump -U postgres epizza_db > /backups/epizza_$(date +\%Y\%m\%d).sql
```

### Restauração

```bash
# Restaurar backup
docker-compose exec -T postgres psql -U postgres epizza_db < backup_20250114.sql
```

### Backup de Arquivos

```bash
# Criar backup completo
tar -czf epizza-backup-$(date +%Y%m%d).tar.gz \
  /home/user/Epizza-V2 \
  --exclude=node_modules \
  --exclude=dist

# Restaurar
tar -xzf epizza-backup-20250114.tar.gz -C /
```

---

## 🔄 Atualização da Aplicação

### Pull e Restart

```bash
cd /home/user/Epizza-V2

# Parar containers
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### Zero-Downtime Deployment

```bash
# Build nova versão
docker-compose build

# Scaling gradual
docker-compose up -d --scale backend=2
sleep 30
docker-compose up -d --scale backend=1
```

---

## 📈 Otimizações de Performance

### 1. Habilitar Compressão Gzip

Já configurado em `nginx.conf`

### 2. Cache de Assets Estáticos

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PostgreSQL Tuning

```bash
# Editar postgresql.conf
docker-compose exec postgres vi /var/lib/postgresql/data/postgresql.conf

# Configurações recomendadas para 4GB RAM:
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
```

---

## 🆘 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker-compose logs backend

# Verificar configurações
docker-compose config

# Rebuild
docker-compose up -d --build --force-recreate
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DB_
```

### SSL não funciona

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Verificar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📞 Suporte

Problemas? Entre em contato:

- **Email**: admin@epizza.com
- **GitHub Issues**: https://github.com/eloviskis/Epizza-V2/issues
- **Documentação**: README.md

---

**Última atualização**: 14 de Janeiro de 2025
