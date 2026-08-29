# 📖 Guia do Usuário - Sistema de Controle de Tratamento

---

## 📋 Índice

1. [Acessando o Sistema](#1-acessando-o-sistema)
2. [Fazendo Login](#2-fazendo-login)
3. [Dashboard](#3-dashboard)
4. [Gerenciando Pacientes - Rede Básica](#4-gerenciando-pacientes---rede-básica)
5. [Gerenciando Pacientes - Rotina](#5-gerenciando-pacientes---rotina)
6. [Gerenciando Localidades e PSFs](#6-gerenciando-localidades-e-psfs)
7. [Gerando Relatórios](#7-gerando-relatórios)
8. [Gerenciando Usuários](#8-gerenciando-usuários)
9. [Configurações](#9-configurações)
10. [Dicas e Boas Práticas](#10-dicas-e-boas-práticas)

---

## 1. Acessando o Sistema

1. Abra seu navegador (Chrome, Firefox, Edge, etc.)
2. Acesse: **https://frontend-controle-tratamento.vercel.app**
3. Você verá a tela de login do sistema

---

## 2. Fazendo Login

### Como logar:

1. Digite seu **e-mail** no campo "E-mail"
2. Digite sua **senha** no campo "Senha"
3. Clique no botão **"Entrar no Sistema"**

### Credenciais de teste:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Administrador** | admin@sistema.com | admin123 |
| **Usuário** | usuario@sistema.com | admin123 |

### Dicas:

- ✅ Se você esquecer sua senha, entre em contato com o administrador
- ✅ Após 3 tentativas erradas, sua conta pode ser bloqueada temporariamente
- ✅ Use credenciais seguras (pelo menos 8 caracteres, com letras e números)

---

## 3. Dashboard

Após o login, você será direcionado ao **Dashboard**.

### Cards de estatísticas:

| Card | O que mostra |
|------|--------------|
| **Total de Pacientes** | Número total de pacientes cadastrados |
| **Pacientes Tratados** | Quantos pacientes já receberam tratamento |
| **Aguardando Tratamento** | Quantos pacientes estão pendentes |
| **Revisões Realizadas** | Quantas revisões foram feitas |

### Últimos pacientes:

- Lista dos 5 pacientes mais recentes cadastrados
- Clique em **"Ver todos"** para ver a lista completa

---

## 4. Gerenciando Pacientes - Rede Básica

### Acessar a lista:

1. Clique em **"Rede Básica"** no menu lateral

### Buscar paciente:

1. Digite o nome no campo de busca
2. A busca acontece em tempo real (enquanto você digita)

### Filtrar pacientes:

1. Clique no botão **"Filtros"**
2. Selecione os filtros desejados:
   - **Localidade**
   - **PSF**
   - **Ano**
   - **Tratado** (Sim/Não)
3. Clique em **"Aplicar Filtros"**

### Cadastrar novo paciente:

1. Clique em **"Novo Paciente"**
2. Preencha os campos obrigatórios (*):
   - **Nome**
   - **PSF**
   - **Localidade**
3. Preencha os campos opcionais:
   - **Ano**
   - **Quarteirão**
   - **Nº Imóvel**
   - **Entrega de Documento** (Sim/Não)
   - **Entrega de Medicamento** (Sim/Não)
   - **Data de Tratamento**
   - **Revisão** (Pendente/Feita)
   - **Telefone**
   - **Observação**
4. Clique em **"Cadastrar"**

### Editar paciente:

1. Na lista, clique no ícone de **lápis** ✏️
2. Altere os dados desejados
3. Clique em **"Atualizar"**

### Excluir paciente:

1. Na lista, clique no ícone de **lixeira** 🗑️
2. Confirme a exclusão na caixa de diálogo

### Regras de negócio:

| Regra | Descrição |
|-------|-----------|
| **Data de Tratamento** | Não pode ser no futuro |
| **Revisão** | Só pode ser "Feita" se houver data de tratamento |
| **Data de Revisão** | Calculada automaticamente (40 dias após o tratamento) |
| **Atraso** | Se a revisão não for feita até a data prevista, aparece como "Atrasada" |

---

## 5. Gerenciando Pacientes - Rotina

### Acessar a lista:

1. Clique em **"Rotina"** no menu lateral

### Campos específicos da Rotina:

| Campo | Descrição |
|-------|-----------|
| **Nº Amostra** | Número de identificação da amostra (obrigatório) |
| **Controle (SISPCE)** | Número do lote de controle |
| **Entrega Resultado** | Se o resultado foi entregue (Sim/Não) |

### Buscar, filtrar, cadastrar, editar e excluir:

- As mesmas funcionalidades da Rede Básica se aplicam
- Os filtros disponíveis são os mesmos

---

## 6. Gerenciando Localidades e PSFs

### Localidades:

1. Clique em **"Localidades"** no menu lateral
2. Visualize todas as localidades cadastradas
3. Use os botões para:
   - **Adicionar** nova localidade
   - **Editar** localidade existente
   - **Excluir** localidade

### PSFs (Unidades de Saúde):

1. Clique em **"PSFs"** no menu lateral
2. Visualize todos os PSFs cadastrados
3. Use os botões para:
   - **Adicionar** novo PSF
   - **Editar** PSF existente
   - **Excluir** PSF

---

## 7. Gerando Relatórios

### Onde encontrar:

- Na página de **Rede Básica** ou **Rotina**

### Tipos de relatório:

| Botão | Formato | Descrição |
|-------|---------|-----------|
| **CSV** | .csv | Arquivo de texto separado por vírgulas (abre no Excel) |
| **Excel** | .xlsx | Arquivo nativo do Excel |
| **PDF** | .pdf | Documento em PDF (para impressão) |

### Como gerar:

1. Aplique os filtros desejados (opcional)
2. Clique no botão do formato desejado
3. O arquivo será baixado automaticamente no seu navegador

### O que é gerado:

- **Todos os dados** que estão visíveis na tabela
- **Respeitando os filtros** aplicados

---

## 8. Gerenciando Usuários

### Quem pode gerenciar:

- **Apenas administradores**

### Como acessar:

1. Clique em **"Usuários"** no menu lateral
2. Visualize todos os usuários cadastrados

### Perfis de usuário:

| Perfil | Permissões |
|--------|------------|
| **Administrador** | Acesso total ao sistema (todas as funcionalidades) |
| **Usuário** | Acesso a todas as funcionalidades, exceto gerenciamento de usuários |
| **Visualizador** | Apenas visualização de dados (não pode cadastrar, editar ou excluir) |

---

## 9. Configurações

### Como acessar:

1. Clique em **"Configurações"** no menu lateral
2. Ajuste as configurações conforme necessário
3. Clique em **"Salvar"** para aplicar as alterações

---

## 10. Dicas e Boas Práticas

### 🔒 Segurança:

- **Não compartilhe sua senha** com ninguém
- **Sempre faça logout** ao sair do sistema
- **Use senhas fortes** (pelo menos 8 caracteres, com letras e números)

### 📊 Eficiência:

- **Use filtros** para encontrar rapidamente os pacientes
- **Gere relatórios** para análise de dados
- **Use a busca** para encontrar pacientes por nome

### 🏥 Gestão de Pacientes:

- **Mantenha os dados atualizados**
- **Registre o tratamento** assim que for realizado
- **Acompanhe as revisões** para evitar atrasos
- **Verifique as notificações** de revisões atrasadas

---

## 📞 Suporte

Em caso de dúvidas ou problemas, entre em contato:

| Contato | Informação |
|---------|------------|
| **E-mail** | mmnc12@gmail.com |
| **GitHub** | https://github.com/mmnc12 |

---

**Versão do documento:** 1.0.0
**Última atualização:** 28/08/2026