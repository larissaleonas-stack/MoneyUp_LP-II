# 🚀 Guia Completo: Testando o Sistema de Autenticação MoneyUp

## Pré-requisitos

- ✅ Node.js v18+ instalado
- ✅ npm instalado
- ✅ VS Code com extensão REST Client
- ✅ Pasta do projeto aberta em VS Code

---

## PARTE 1: Preparação do Projeto

### Passo 1.1 - Instalar dependências

Abra o terminal e execute:

```bash
npm install
```

**Saída esperada:**

```
added 150+ packages in X.XXs
```

---

### Passo 1.2 - Configurar variáveis de ambiente

Crie arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-segredo-super-seguro-aqui"
JWT_EXPIRES_IN="1h"
BCRYPT_SALT_ROUNDS="10"
PORT="3000"
```

**Localização:** Raiz do projeto (ao lado de `package.json`)

---

### Passo 1.3 - Preparar o banco de dados

Execute as migrações do Prisma:

```bash
npx prisma migrate dev --name init
```

**O que acontece:**

- Cria o arquivo `dev.db` (banco SQLite)
- Cria as tabelas: Usuario, Gasto, Categoria, FormaPagamento
- Se pedir nome, escreva: `init`

**Saída esperada:**

```
✓ Your database has been successfully created
✓ Prisma has created your migration files
```

---

### Passo 1.4 - Seed do banco de dados (opcional)

Para preencher com dados de teste:

```bash
node prisma/seed.js
```

**Saída esperada:**

```
Database seeded successfully!
```

---

## PARTE 2: Iniciar o Servidor

### Passo 2.1 - Inicie o servidor de desenvolvimento

Em um terminal, execute:

```bash
npm run dev
```

**Saída esperada:**

```
Server running at http://localhost:3000
```

⚠️ **NÃO feche este terminal! Ele mantém o servidor rodando.**

---

### Passo 2.2 - Validar se servidor está rodando

Abra outro terminal e teste:

```bash
curl http://localhost:3000/categorias
```

Ou no navegador: `http://localhost:3000/categorias`

Deve retornar um JSON com as categorias.

---

## PARTE 3: Testar via REST Client (Recomendado)

### Passo 3.1 - Abrir o arquivo requests.http

No VS Code, abra o arquivo `requests.http` (já está no projeto).

---

### Passo 3.2 - Executar Teste 1: Cadastro (Register)

Procure por:

```
### Test 1: Register Valid User
POST http://localhost:3000/auth/register
```

**Clique em "Send Request"** (aparece acima do POST)

**Saída esperada (Response):**

```json
HTTP/1.1 201 Created

{
  "id": 1,
  "nome": "Teste User",
  "email": "teste@email.com"
}
```

✅ **Sucesso!** O usuário foi criado.

---

### Passo 3.3 - Executar Teste 2: Login

Procure por:

```
### Test 2: Login Valid Credentials
POST http://localhost:3000/auth/login
```

**Clique em "Send Request"**

**Saída esperada:**

```json
HTTP/1.1 200 OK

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Teste User",
    "email": "teste@email.com"
  }
}
```

✅ **Token gerado com sucesso!**

---

### Passo 3.4 - COPIAR O TOKEN

1. Copie o valor do `token` da resposta anterior
2. No arquivo `requests.http`, procure por:
   ```
   @token = seu-token-aqui
   ```
3. Substitua `seu-token-aqui` pelo token copiado:
   ```
   @token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Passo 3.5 - Executar Teste 3: Acessar Rota Protegida (/me)

Procure por:

```
### Test 3: Get User Info (Protected Route)
GET http://localhost:3000/me
Authorization: Bearer {{token}}
```

**Clique em "Send Request"**

**Saída esperada:**

```json
HTTP/1.1 200 OK

{
  "user": {
    "id": 1,
    "email": "teste@email.com"
  }
}
```

✅ **Autenticação funcionando!**

---

### Passo 3.6 - Executar Teste 4: Login com Credenciais Inválidas

Procure por:

```
### Test 4: Login Invalid Credentials
POST http://localhost:3000/auth/login
```

(A segunda vez que aparece, com senha errada)

**Clique em "Send Request"**

**Saída esperada:**

```json
HTTP/1.1 401 Unauthorized

{
  "erro": "Usuário ou senha inválidos"
}
```

✅ **Validação funcionando!**

---

### Passo 3.7 - Testar Endpoints de Gastos

#### 3.7.1 - Listar Categorias (para pegar IDs válidas)

Procure por:

```
### Get Categories
GET http://localhost:3000/categorias
```

**Saída esperada:**

```json
[
  { "id": 1, "nome": "Alimentação" },
  { "id": 2, "nome": "Transporte" },
  ...
]
```

**Guarde o ID de uma categoria** (ex: 1)

---

#### 3.7.2 - Listar Formas de Pagamento

Procure por:

```
### Get Payment Methods
GET http://localhost:3000/formas-pagamento
```

**Saída esperada:**

```json
[
  { "id": 1, "nome": "Débito" },
  { "id": 2, "nome": "Crédito" },
  ...
]
```

**Guarde o ID de uma forma de pagamento** (ex: 1)

---

#### 3.7.3 - Criar Gasto (Requer Autenticação)

Procure por:

```
### Create Gasto (Protected)
POST http://localhost:3000/gastos
Authorization: Bearer {{token}}
```

**Edite o JSON do body:**

```json
{
  "descricao": "Almoço no restaurante",
  "valor": 35.5,
  "data": "2026-08-23",
  "categoriaId": 1,
  "formaPagamentoId": 1
}
```

(Use os IDs que guardou nos passos anteriores)

**Clique em "Send Request"**

**Saída esperada:**

```json
HTTP/1.1 201 Created

{
  "id": 1,
  "descricao": "Almoço no restaurante",
  "valor": 35.50,
  "data": "2026-08-23",
  "usuarioId": 1,
  "categoriaId": 1,
  "formaPagamentoId": 1
}
```

✅ **Gasto criado com autenticação!**

---

#### 3.7.4 - Listar Gastos

Procure por:

```
### Get All Gastos
GET http://localhost:3000/gastos
```

**Clique em "Send Request"**

**Saída esperada:**

```json
[
  {
    "id": 1,
    "descricao": "Almoço no restaurante",
    "valor": 35.50,
    "usuario": { "id": 1, "nome": "Teste User" },
    ...
  }
]
```

---

## PARTE 4: Testar via Frontend

### Passo 4.1 - Abrir a Página de Login

No navegador, acesse:

```
http://localhost:3000/frontend/login.html
```

---

### Passo 4.2 - Fazer Login

1. **Email:** Digite o email cadastrado (ex: `teste@email.com`)
2. **Senha:** Digite a senha (ex: `Senha123`)
3. **Clique em "Entrar"**

**Esperado:**

- Token aparece no console (F12 → Console)
- Redirecionado para a tela principal

---

### Passo 4.3 - Acessar a Área de Gastos

1. Clique em **"Cadastrar Gasto"** (ou "Novo Gasto")
2. Preencha:
   - **Descrição:** "Café da manhã"
   - **Valor:** 15.00
   - **Data:** 2026-08-23
   - **Categoria:** Alimentação
   - **Forma de Pagamento:** Dinheiro
3. Clique em **"Salvar"**

**Esperado:**

- Mensagem de sucesso
- Gasto aparece na lista

---

### Passo 4.4 - Ver Lista de Gastos

1. Clique em **"Meus Gastos"**
2. Deve mostrar todos os gastos do usuário autenticado

---

### Passo 4.5 - Fazer Logout

1. Clique em **"Sair"** ou **"Logout"**
2. Redirecionado para tela de login
3. sessionStorage limpo (token removido)

---

## PARTE 5: Testes Automatizados

### Passo 5.1 - Executar Script de Testes

Abra um terminal NOVO (o servidor continua no primeiro) e execute:

```bash
node scripts/test-auth-extended.mjs
```

**O script vai:**

1. ✅ Registrar novo usuário
2. ✅ Tentar registrar email duplicado (deve falhar)
3. ✅ Fazer login com senha errada (deve falhar)
4. ✅ Fazer login com sucesso (gera token)
5. ✅ Acessar /me sem token (deve falhar)
6. ✅ Acessar /me com token (deve suceder)
7. ✅ Criar gasto sem autenticação (deve falhar)
8. ✅ Criar gasto com autenticação (deve suceder)
9. ✅ Teste de autorização (usuário B tenta deletar gasto de A)

**Saída esperada:**

```
✅ Test 1 PASSED: Register new user
✅ Test 2 PASSED: Duplicate email
✅ Test 3 PASSED: Invalid password
✅ Test 4 PASSED: Valid login
✅ Test 5 PASSED: GET /me without token
✅ Test 6 PASSED: GET /me with token
✅ Test 7 PASSED: Create gasto without auth
✅ Test 8 PASSED: Create gasto with auth
✅ Test 9 PASSED: Authorization check
✅ Test 10 PASSED: User A deletes own gasto

All tests completed!
```

---

### Passo 5.2 - Verificar Resultados dos Testes

Os resultados são salvos em:

```
tests/auth-results.txt
```

Abra esse arquivo para ver o relatório completo.

---

## PARTE 6: Compilar TypeScript

### Passo 6.1 - Build do projeto

```bash
npm run build
```

**Saída esperada:**

```
Successfully compiled TypeScript files
```

---

## PARTE 7: Troubleshooting

### ❌ Erro: "Port 3000 already in use"

**Solução:**

```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <NUMERO> /F

# Ou mude a porta no .env:
PORT=3001
```

---

### ❌ Erro: "Cannot find module 'bcrypt'"

**Solução:**

```bash
npm install
npm install bcrypt
```

---

### ❌ Erro: "Database does not exist"

**Solução:**

```bash
npx prisma migrate dev
```

---

### ❌ Erro: "Token invalid or expired"

**Solução:**

1. Faça login novamente
2. Copie o novo token
3. Atualize `@token` no requests.http

---

### ❌ Erro no Frontend: "Unexpected end of JSON input"

**Solução:**

- Verifique se o servidor está rodando
- Abra DevTools (F12) → Console
- Procure por mensagens de erro vermelhas

---

## ✅ Checklist Final

Depois de passar por todos os passos, você terá validado:

- ✅ Banco de dados criado e rodando
- ✅ Servidor Express rodando na porta 3000
- ✅ Cadastro de usuário funcionando
- ✅ Login gerando JWT válido
- ✅ Rotas protegidas autenticando com middleware
- ✅ Gastos criados com usuário autenticado
- ✅ Frontend login/logout funcionando
- ✅ sessionStorage armazenando token apenas na aba atual
- ✅ authFetch adicionando header Authorization
- ✅ Testes automatizados passando
- ✅ Validação de autorização (ownership)

---

## 📋 Resumo dos Comandos Principais

```bash
# Instalar dependências
npm install

# Preparar banco de dados
npx prisma migrate dev

# Iniciar servidor
npm run dev

# Em outro terminal: Rodar testes
node scripts/test-auth-extended.mjs

# Compilar TypeScript
npm run build
```

---

## 🎯 Próximas Ações

Depois de testar tudo:

1. ✅ Confirmar que todos os testes passam
2. ✅ Documento de validação pronto
3. ✅ Código pronto para submission

**Status:** ✅ Projeto 100% funcional e testado!
