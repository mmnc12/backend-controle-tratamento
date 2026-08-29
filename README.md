# 🏥 Sistema de Controle de Tratamento - Backend

API RESTful para gerenciamento de pacientes com esquistossomose, desenvolvida para o Setor de Endemias.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Como Rodar](#como-rodar)
- [Deploy](#deploy)
- [Credenciais de Teste](#credenciais-de-teste)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Licença](#licença)

---

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | v18+ | Runtime JavaScript |
| Express | v4 | Framework backend |
| TypeScript | v5 | Superset tipado do JavaScript |
| MySQL | v8 | Banco de dados relacional |
| JWT | - | Autenticação via tokens |
| bcryptjs | - | Hash de senhas |

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com JWT
- Controle de perfil (admin, usuario, visualizador)
- Logout
- Proteção de rotas

### 👥 Gestão de Pacientes
- **Rede Básica**: CRUD completo
- **Rotina**: CRUD completo
- Filtros avançados (ano, localidade, PSF, nome, tratado)
- Paginação

### 📍 Gestão de Cadastros
- **Localidades**: CRUD completo
- **PSFs**: CRUD completo
- **Usuários**: CRUD completo (apenas admin)

### 📊 Relatórios
- **CSV**: Download de dados
- **Excel**: Download de dados (XLSX)
- **PDF**: Download de dados
- Filtros aplicáveis aos relatórios

---

## 🛠️ Como Rodar

### Pré-requisitos

- Node.js (v18+)
- MySQL (v8+)
- npm ou yarn

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/mmnc12/backend-controle-tratamento.git
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
🌐 Deploy
Backend (Render)
URL: https://backend-controle-tratamento.onrender.com

Status: ✅ Produção

Repositório: https://github.com/mmnc12/backend-controle-tratamento

Banco de Dados (Clever Cloud)
Tipo: MySQL

Status: ✅ Produção

🔐 Credenciais de Teste
Perfil	E-mail	Senha
Admin	admin@sistema.com	admin123
Usuário	usuario@sistema.com	admin123
📁 Estrutura do Projeto
text
backend-controle-tratamento/
├── src/
│   ├── config/          # Configurações (database, CORS, etc.)
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares (auth, CORS, rate limit)
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (lógica de negócio)
│   └── utils/           # Utilitários
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json
└── tsconfig.json
📄 Licença
MIT © Manoel Mecias do Nascimento

📞 Contato
Autor: Manoel Mecias do Nascimento

Email: mmnc12@gmail.com

GitHub: https://github.com/mmnc12