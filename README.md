# 🏥 Backend - Sistema de Controle de Tratamento

API RESTful para gerenciamento de pacientes com esquistossomose, desenvolvida para o Setor de Endemias.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Como Rodar](#como-rodar)
- [Banco de Dados](#banco-de-dados)
- [Endpoints](#endpoints)
- [Credenciais de Teste](#credenciais-de-teste)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Licença](#licença)

---

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | v18+ | Runtime JavaScript |
| TypeScript | v5 | Superset tipado do JavaScript |
| Express | v4 | Framework web |
| MySQL | v8 | Banco de dados relacional |
| JWT | - | Autenticação via tokens |
| bcryptjs | - | Hash de senhas |
| dotenv | - | Variáveis de ambiente |

---

## ✨ Funcionalidades

- 🔐 Autenticação JWT (login, logout, refresh)
- 👥 CRUD de Usuários (admin)
- 📍 CRUD de Localidades
- 🏥 CRUD de PSFs (Unidades de Saúde)
- 🩺 CRUD de Rede Básica
- 🔬 CRUD de Rotina (Setor de Endemias)
- 🔍 Filtros avançados (nome, localidade, PSF, ano, data, tratado, revisão)
- 📄 Relatórios (CSV, Excel, PDF)
- 📊 Paginação
- ✅ Validações de negócio (revisão sem tratamento, data futura, etc.)

---

## 🛠️ Como Rodar

### Pré-requisitos

- Node.js (v18+)
- MySQL (v8+)
- npm ou yarn

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/backend-controle-tratamento.git
cd backend-controle-tratamento

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# 4. Criar o banco de dados
# Execute o script SQL no MySQL Workbench ou terminal

# 5. Rodar em desenvolvimento
npm run dev

# 6. Build para produção
npm run build
npm start
🗄️ Banco de Dados
Script de criação
Execute o script database.sql no MySQL Workbench ou terminal:

sql
CREATE DATABASE controle_tratamento_p;
USE controle_tratamento_p;

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
🔗 Endpoints
Autenticação
Método	Endpoint	Descrição
POST	/api/auth/login	Login do usuário
GET	/api/auth/me	Dados do usuário logado
Localidades
Método	Endpoint	Descrição
GET	/api/localidades	Listar localidades
GET	/api/localidades/:id	Buscar localidade
POST	/api/localidades	Criar localidade
PUT	/api/localidades/:id	Atualizar localidade
DELETE	/api/localidades/:id	Deletar localidade
Rede Básica
Método	Endpoint	Descrição
GET	/api/rede-basica	Listar pacientes (com filtros e paginação)
GET	/api/rede-basica/:id	Buscar paciente
POST	/api/rede-basica	Criar paciente
PUT	/api/rede-basica/:id	Atualizar paciente
DELETE	/api/rede-basica/:id	Deletar paciente
Rotina
Método	Endpoint	Descrição
GET	/api/rotina	Listar pacientes (com filtros e paginação)
GET	/api/rotina/:id	Buscar paciente
POST	/api/rotina	Criar paciente
PUT	/api/rotina/:id	Atualizar paciente
DELETE	/api/rotina/:id	Deletar paciente
Relatórios
Método	Endpoint	Descrição
GET	/api/relatorios/rede-basica/csv	Relatório CSV
GET	/api/relatorios/rede-basica/excel	Relatório Excel
GET	/api/relatorios/rede-basica/pdf	Relatório PDF
GET	/api/relatorios/rotina/csv	Relatório CSV Rotina
🔑 Credenciais de Teste
Perfil	Email	Senha
Admin	admin@sistema.com	admin123
Usuário	usuario@sistema.com	admin123
📁 Estrutura do Projeto
text
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Conexão MySQL
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── localidadeController.ts
│   │   ├── psfController.ts
│   │   ├── redeBasicaController.ts
│   │   ├── rotinaController.ts
│   │   └── relatorioController.ts
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   │   └── auth.ts              # Autenticação JWT
│   ├── utils/
│   └── app.ts                   # Ponto de entrada
├── .env
├── package.json
└── tsconfig.json
📄 Licença
MIT

📞 Contato
Autor: Manoel Mecias do Nascimento 

Email: mmnc12@gmail.com

