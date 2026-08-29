# 🛠️ Guia do Desenvolvedor - Sistema de Controle de Tratamento

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Ambiente](#2-configuração-do-ambiente)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Banco de Dados](#5-banco-de-dados)
6. [Deploy](#6-deploy)
7. [Troubleshooting](#7-troubleshooting)
8. [Contribuição](#8-contribuição)

---

## 1. Pré-requisitos

### Softwares necessários:

| Software | Versão | Download |
|----------|--------|----------|
| Node.js | v18+ | https://nodejs.org |
| MySQL | v8+ | https://mysql.com |
| Git | latest | https://git-scm.com |
| VS Code | latest | https://code.visualstudio.com |

### Contas necessárias:

| Plataforma | Finalidade |
|------------|------------|
| GitHub | Versionamento de código |
| Render | Deploy do backend |
| Vercel | Deploy do frontend |
| Clever Cloud | Banco de dados MySQL |

---

## 2. Configuração do Ambiente

### Backend:

```bash
# 1. Clonar o repositório
git clone https://github.com/mmnc12/backend-controle-tratamento.git
cd backend-controle-tratamento

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Editar .env com suas credenciais
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=suasenha
DB_NAME=controle_tratamento_p
JWT_SECRET=seu_jwt_secret
Frontend:
bash
# 1. Clonar o repositório
git clone https://github.com/mmnc12/frontend-controle-tratamento.git
cd frontend-controle-tratamento

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Editar .env
VITE_API_URL=http://localhost:3000/api
3. Backend
Estrutura do Projeto:
text
src/
├── config/
│   └── database.ts       # Conexão com o banco de dados
├── controllers/
│   ├── authController.ts # Autenticação
│   ├── localidadeController.ts
│   ├── psfController.ts
│   ├── redeBasicaController.ts
│   ├── rotinaController.ts
│   └── relatorioController.ts
├── middlewares/
│   ├── auth.ts           # Autenticação JWT
│   └── cors.ts           # Configuração CORS
├── routes/
│   ├── authRoutes.ts
│   ├── localidadeRoutes.ts
│   ├── psfRoutes.ts
│   ├── redeBasicaRoutes.ts
│   ├── rotinaRoutes.ts
│   └── relatorioRoutes.ts
├── services/
│   ├── redeBasicaService.ts
│   ├── rotinaService.ts
│   └── relatorioService.ts
├── types/
│   └── index.ts          # Tipos TypeScript
└── app.ts                # Ponto de entrada
Scripts disponíveis:
bash
npm run dev      # Desenvolvimento (hot reload)
npm run build    # Build para produção
npm start        # Iniciar em produção
npm run lint     # Verificar código
Rotas principais:
Método	Endpoint	Descrição
POST	/api/auth/login	Login do usuário
GET	/api/auth/me	Dados do usuário logado
GET	/api/auth/health	Verificar status da API
GET	/api/localidades	Listar localidades
POST	/api/localidades	Criar localidade
PUT	/api/localidades/:id	Atualizar localidade
DELETE	/api/localidades/:id	Excluir localidade
GET	/api/psf	Listar PSFs
POST	/api/psf	Criar PSF
PUT	/api/psf/:id	Atualizar PSF
DELETE	/api/psf/:id	Excluir PSF
GET	/api/rede-basica	Listar pacientes da Rede Básica
POST	/api/rede-basica	Criar paciente
PUT	/api/rede-basica/:id	Atualizar paciente
DELETE	/api/rede-basica/:id	Excluir paciente
GET	/api/rotina	Listar pacientes da Rotina
POST	/api/rotina	Criar paciente
PUT	/api/rotina/:id	Atualizar paciente
DELETE	/api/rotina/:id	Excluir paciente
GET	/api/relatorios/rede-basica/csv	Relatório CSV da Rede Básica
GET	/api/relatorios/rede-basica/excel	Relatório Excel da Rede Básica
GET	/api/relatorios/rede-basica/pdf	Relatório PDF da Rede Básica
GET	/api/relatorios/rotina/csv	Relatório CSV da Rotina
GET	/api/relatorios/rotina/excel	Relatório Excel da Rotina
GET	/api/relatorios/rotina/pdf	Relatório PDF da Rotina
4. Frontend
Estrutura do Projeto:
text
src/
├── api/
│   ├── axiosConfig.ts    # Configuração Axios
│   ├── authApi.ts
│   ├── localidadeApi.ts
│   ├── psfApi.ts
│   ├── redeBasicaApi.ts
│   ├── relatorioApi.ts
│   └── rotinaApi.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       └── Pagination.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── AuthContextCore.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Localidades.tsx
│   ├── PSFs.tsx
│   ├── RedeBasica.tsx
│   ├── Relatorios.tsx
│   ├── Rotina.tsx
│   ├── Usuarios.tsx
│   └── Configuracoes.tsx
├── types/
│   └── index.ts
└── utils/
    ├── dateUtils.ts
    ├── errorHandler.ts
    └── downloadUtils.ts
Scripts disponíveis:
bash
npm run dev      # Desenvolvimento (hot reload)
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar código
5. Banco de Dados
Modelo de Dados:
sql
-- Tabela localidades
CREATE TABLE localidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela psf
CREATE TABLE psf (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_enfermeira VARCHAR(100)
);

-- Tabela usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'usuario', 'visualizador') DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL
);

-- Tabela rede_basica
CREATE TABLE rede_basica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ano INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    psf_id INT NOT NULL,
    localidade_id INT NOT NULL,
    quarteirao VARCHAR(50),
    numero_imovel VARCHAR(20),
    entrega_documento ENUM('S', 'N') DEFAULT 'N',
    entrega_medicamento ENUM('S', 'N') DEFAULT 'N',
    data_tratamento DATE,
    data_revisao DATE,
    revisao ENUM('S', 'N') DEFAULT 'N',
    telefone VARCHAR(20),
    observacao TEXT,
    FOREIGN KEY (psf_id) REFERENCES psf(id),
    FOREIGN KEY (localidade_id) REFERENCES localidades(id)
);

-- Tabela rotina
CREATE TABLE rotina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ano INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    numero_amostra VARCHAR(50) NOT NULL,
    controle VARCHAR(50),
    psf_id INT NOT NULL,
    localidade_id INT NOT NULL,
    quarteirao VARCHAR(50),
    numero_imovel VARCHAR(20) NOT NULL,
    entrega_resultado ENUM('S', 'N') DEFAULT 'N',
    entrega_documento ENUM('S', 'N') DEFAULT 'N',
    entrega_medicamento ENUM('S', 'N') DEFAULT 'N',
    data_tratamento DATE,
    data_revisao DATE,
    revisao ENUM('S', 'N') DEFAULT 'N',
    telefone VARCHAR(20),
    observacao TEXT,
    FOREIGN KEY (psf_id) REFERENCES psf(id),
    FOREIGN KEY (localidade_id) REFERENCES localidades(id),
    UNIQUE KEY unique_amostra_ano (ano, numero_amostra)
);
Script para popular dados iniciais:
sql
-- Inserir usuário admin
INSERT INTO usuarios (nome, email, senha, perfil) VALUES 
('Administrador', 'admin@sistema.com', '$2b$10$...', 'admin');

-- Inserir usuário comum
INSERT INTO usuarios (nome, email, senha, perfil) VALUES 
('Usuário', 'usuario@sistema.com', '$2b$10$...', 'usuario');
6. Deploy
Backend (Render):
Acesse: https://dashboard.render.com

Clique em "New +" → "Web Service"

Conecte o repositório GitHub

Configure:

Build Command: npm install && npm run build

Start Command: npm start

Adicione as variáveis de ambiente

Clique em "Create Web Service"

Frontend (Vercel):
Acesse: https://vercel.com

Clique em "Add New..." → "Project"

Selecione o repositório

Configure as variáveis de ambiente

Clique em "Deploy"

Variáveis de Ambiente:
Backend (.env):

text
NODE_ENV=production
PORT=10000
DB_HOST=by0cgjw9kb6tmf2dy9pb-mysql.services.clever-cloud.com
DB_PORT=3306
DB_USER=ubltjfsnbeno5cka
DB_PASSWORD=a7zaPGOXSIJrldInqWWo
DB_NAME=by0cgjw9kb6tmf2dy9pb
JWT_SECRET=d69ca6d20d42115912cd8475663d4316e2d06a2a711486fd3a6b0d5473342fd9
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
Frontend (.env):

text
VITE_API_URL=https://backend-controle-tratamento.onrender.com/api
7. Troubleshooting
Erros comuns:
Erro	Solução
ECONNREFUSED	Verificar se o MySQL está rodando
ER_ACCESS_DENIED_ERROR	Verificar credenciais do MySQL
ER_BAD_DB_ERROR	Criar o banco de dados
JWT_SECRET not found	Configurar JWT_SECRET no .env
CORS error	Verificar CORS_ORIGIN no .env
404 on refresh	Verificar vercel.json no frontend
ER_USER_LIMIT_REACHED	Reduzir connectionLimit no pool do MySQL
Comandos úteis:
bash
# Ver logs do backend
npm run dev

# Ver logs do frontend
npm run dev

# Reiniciar MySQL (Windows)
net stop MySQL && net start MySQL

# Limpar cache do npm
npm cache clean --force

# Reconstruir node_modules
rm -rf node_modules && npm install

# Verificar portas em uso (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :5173
8. Contribuição
Como contribuir:
Faça um fork do repositório

Crie uma branch para sua feature:

bash
git checkout -b feature/nova-funcionalidade
Faça suas alterações

Commit suas mudanças:

bash
git commit -m "feat: adicionar nova funcionalidade"
Push para a branch:

bash
git push origin feature/nova-funcionalidade
Abra um Pull Request

Padrões de código:
Padrão	Descrição
TypeScript	Use tipos sempre que possível
Nomes	Use nomes descritivos em inglês ou português
Comentários	Documente funções complexas
Commits	Use o padrão tipo: descrição
Padrão de commits:
Tipo	Descrição
feat	Nova funcionalidade
fix	Correção de bug
docs	Documentação
style	Formatação
refactor	Refatoração
test	Testes
chore	Manutenção
📞 Contato
Contato	Informação
Autor	Manoel Mecias do Nascimento
Email	mmnc12@gmail.com
GitHub	https://github.com/mmnc12
Versão do documento: 1.0.0
Última atualização: 28/08/2026