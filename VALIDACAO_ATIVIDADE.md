# Validação da Atividade: B3.1 - Autenticação de Usuário

**Data:** 2026-08-23  
**Disciplina:** Banco de Dados II  
**Projeto:** MoneyUp  
**Atividade:** Implementação de Autenticação (Auth) em Aplicação Web  
**Pontuação Total:** 100 pontos

---

## ✅ Requisito 1: Modelagem de Usuários e Segurança das Credenciais (20 pts)

### Status: COMPLETO

**Arquivo:** `prisma/schema.prisma`

### Modelagem do usuário:

```prisma
model Usuario {
  id Int @id @default(autoincrement())
  nome String
  email String @unique
  senhaHash String
  criadoEm DateTime @default(now())
  gastos Gasto[]
}
```

### Aspectos Atendidos:

✅ **Atributos Obrigatórios:**

- `id`: identificador único (autoincrement)
- `nome`: nome do usuário
- `email`: e-mail única (@unique)
- `senhaHash`: armazenamento seguro de senha
- `criadoEm`: timestamp de criação

✅ **Segurança das Credenciais:**

- Uso de `bcrypt` para hash de senhas (salt rounds: 10)
- Senhas nunca são armazenadas em texto puro
- Validação de senha: mínimo 8 caracteres

✅ **Validações e Restrições:**

- `email @unique`: garante que não haja duplicação
- Validação de dados obrigatórios no controller
- Validação de comprimento mínimo de senha

**Arquivo:** `src/controllers/authController.ts` (linhas 12-17)

```typescript
if (!nome || !email || !senha) throw new HttpError(400, "Dados incompletos");
if (typeof senha !== "string" || senha.length < 8)
  throw new HttpError(400, "Senha muito curta");
```

---

## ✅ Requisito 2: Cadastro e Autenticação de Usuários (20 pts)

### Status: COMPLETO

### Implementação de Fluxos:

**Arquivos:**

- `src/routes/authRoutes.ts`: Rotas
- `src/controllers/authController.ts`: Controllers
- `src/models/usuarioModel.ts`: Model

### 2.1 Fluxo de Cadastro (Register):

**Rota:** `POST /auth/register`

**Controller:** `authController.ts` (linhas 11-25)

```typescript
export const register = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;

  // Validação de dados
  if (!nome || !email || !senha) throw new HttpError(400, "Dados incompletos");

  // Validação de senha
  if (typeof senha !== "string" || senha.length < 8)
    throw new HttpError(400, "Senha muito curta");

  // Verificação de email duplicado
  const existing = await usuarioModel.findByEmail(email);
  if (existing) throw new HttpError(409, "E-mail já cadastrado");

  // Hash e criação
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const user = await usuarioModel.create({ nome, email, senhaHash });
  res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
};
```

✅ **Aspectos Atendidos:**

- Validação de dados obrigatórios
- Hash seguro com bcrypt
- Verificação de email duplicado (409 Conflict)
- Retorno HTTP 201 Created

### 2.2 Fluxo de Autenticação (Login):

**Rota:** `POST /auth/login`

**Controller:** `authController.ts` (linhas 27-44)

```typescript
export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  // Validação de dados
  if (!email || !senha) throw new HttpError(400, "Dados incompletos");

  // Consulta de usuário
  const user = await usuarioModel.findByEmail(email);
  if (!user) throw new HttpError(401, "Usuário ou senha inválidos");

  // Comparação de senha
  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) throw new HttpError(401, "Usuário ou senha inválidos");

  // Geração de token JWT
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({
    token,
    user: { id: user.id, nome: user.nome, email: user.email },
  });
};
```

✅ **Aspectos Atendidos:**

- Validação de dados
- Busca de usuário por email
- Comparação segura com bcrypt.compare
- Geração de JWT com expiração
- Retorno estruturado (token + user info)

### 2.3 Cenários de Erro Tratados:

✅ Usuário inexistente → 401 Usuário ou senha inválidos  
✅ Senha incorreta → 401 Usuário ou senha inválidos  
✅ Dados inválidos → 400 Dados incompletos  
✅ Email duplicado → 409 E-mail já cadastrado  
✅ Senha muito curta → 400 Senha muito curta

---

## ✅ Requisito 3: Sessão/Token e Proteção de Rotas com Middleware (20 pts)

### Status: COMPLETO

### 3.1 Estratégia de Autenticação: JWT

**Configuração:** `src/controllers/authController.ts` (linhas 8-9)

```typescript
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";
```

✅ **Aspectos Atendidos:**

- Uso de JWT (JSON Web Token)
- Assinatura com chave secreta
- Expiração configurável
- Payload contém ID do usuário e email

### 3.2 Middleware de Autenticação

**Arquivo:** `src/middlewares/authMiddleware.ts`

```typescript
export const requireAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return next(new HttpError(401, "Token não fornecido"));

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
    });
    if (!user) return next(new HttpError(401, "Usuário inválido"));
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    return next(new HttpError(401, "Token inválido ou expirado"));
  }
};
```

✅ **Aspectos Atendidos:**

- Extração do token do header Authorization
- Validação do formato Bearer
- Verificação de JWT
- Recuperação de dados do usuário
- Anexação de info do usuário ao request

### 3.3 Proteção de Rotas

**Arquivo:** `src/routes/usuarioRoutes.ts`

```typescript
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

**Arquivo:** `src/routes/gastoRoutes.ts`

```typescript
router.post("/gastos", requireAuth, asyncHandler(criar));
router.put("/gastos/:id", requireAuth, asyncHandler(atualizar));
router.delete("/gastos/:id", requireAuth, asyncHandler(deletar));
```

✅ **Aspectos Atendidos:**

- Rota `/me` acessível apenas com autenticação
- Rotas de gasto protegidas
- Comportamento diferente com/sem token

---

## ✅ Requisito 4: Testes dos Fluxos de Autenticação e Rotas Protegidas (20 pts)

### Status: COMPLETO

**Arquivo:** `requests.http`

### 4.1 Testes Implementados:

✅ **Teste 1: Cadastro válido**

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nome": "Aluno Teste",
  "email": "aluno@exemplo.com",
  "senha": "SenhaSegura123"
}
```

Resposta esperada: 201 Created com ID do usuário

✅ **Teste 2: Autenticação válida**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "aluno@exemplo.com",
  "senha": "SenhaSegura123"
}
```

Resposta esperada: 200 OK com token JWT

✅ **Teste 3: Autenticação com credenciais inválidas**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "aluno@exemplo.com",
  "senha": "senhaErrada"
}
```

Resposta esperada: 401 Unauthorized

✅ **Teste 4: Acesso a rota protegida sem autenticação**

```http
GET http://localhost:3000/me
```

Resposta esperada: 401 Token não fornecido

✅ **Teste 5: Acesso a rota protegida com autenticação válida**

```http
@token = <token_do_login>

GET http://localhost:3000/me
Authorization: Bearer {{token}}
```

Resposta esperada: 200 OK com dados do usuário

### 4.2 Testes Automatizados

**Arquivo:** `scripts/test-auth-extended.mjs`

Testes executados:

- Registro de usuário
- Detecção de email duplicado
- Login com senha inválida
- Login com sucesso
- Acesso a /me sem token
- Acesso a /me com token
- Criação de gasto sem autenticação
- Criação de gasto com autenticação
- Testes de autorização (acesso de outro usuário)

**Resultados salvos em:** `tests/auth-results.txt`

---

## ✅ Requisito 5: Integração da Autenticação com o Front-end (20 pts)

### Status: COMPLETO

### 5.1 Interface de Login e Cadastro

**Arquivos:**

- `frontend/login.html`: Tela de login
- `frontend/cadastro.html`: Tela de cadastro

### 5.2 Implementação de Autenticação no Frontend

**Arquivo:** `frontend/js/auth.mjs`

Funções implementadas:

✅ **register()** - Cadastro de usuário

```javascript
export async function register(nome, email, senha) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  // ... tratamento de erro
  return data;
}
```

✅ **login()** - Autenticação e armazenamento de token

```javascript
export async function login(email, senha) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  // ... validação
  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return data;
}
```

✅ **logout()** - Limpeza e redirecionamento

```javascript
export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.href = "/frontend/login.html";
}
```

✅ **authFetch()** - Requisições autenticadas

```javascript
export function authFetch(url, opts = {}) {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
```

### 5.3 Apresentação de Erros

✅ **Validação de dados** - Campos obrigatórios
✅ **Mensagens de erro** - Erro de login, email duplicado, etc.
✅ **Feedback visual** - Spinner de carregamento

### 5.4 Identificação do Usuário Autenticado

**Arquivo:** `frontend/js/lista.mjs`

```javascript
const user = getUser();
if (user) {
  // Mostra dados do usuário
  // Habilita opções de edit/delete
}
```

### 5.5 Controle de Acesso às Áreas Privadas

**Arquivo:** `frontend/tela2.html` e `frontend/tela3.html`

✅ Redirecionamento para login se não autenticado  
✅ Restrição de funcionalidades se não autenticado  
✅ Logout com limpeza de dados

### 5.6 Proteção de Rotas no Frontend

**Arquivo:** `frontend/js/cadastro.mjs`

```javascript
// Usa authFetch para enviar gasto autenticado
const response = await authFetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    /* dados */
  }),
});
```

---

## 📊 Resumo de Atendimento

| Requisito                    | Pontos  | Status          |
| ---------------------------- | ------- | --------------- |
| 1. Modelagem e Segurança     | 20      | ✅ COMPLETO     |
| 2. Cadastro e Autenticação   | 20      | ✅ COMPLETO     |
| 3. Sessão/Token e Middleware | 20      | ✅ COMPLETO     |
| 4. Testes de Autenticação    | 20      | ✅ COMPLETO     |
| 5. Integração Frontend       | 20      | ✅ COMPLETO     |
| **TOTAL**                    | **100** | **✅ COMPLETO** |

---

## 🚀 Como Executar e Validar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar servidor

```bash
npm run dev
```

### 3. Testar via REST Client

Abra `requests.http` no VS Code e execute os blocos em ordem.

### 4. Testar via Frontend

Acesse `http://localhost:3000/frontend/login.html` no navegador.

### 5. Executar testes automatizados

```bash
node scripts/test-auth-extended.mjs
```

---

## 📋 Checklist de Entrega

- ✅ Modelagem de usuário com hash de senha (bcrypt)
- ✅ Rotas de cadastro e login (POST)
- ✅ Validação de dados e tratamento de erros
- ✅ Middleware de autenticação
- ✅ Geração e validação de JWT
- ✅ Proteção de rotas com middleware
- ✅ Testes no REST Client (requests.http)
- ✅ Testes automatizados (scripts)
- ✅ Interface de login e cadastro no frontend
- ✅ Armazenamento de token na aba atual (sessionStorage)
- ✅ Logout e limpeza de dados
- ✅ Controle de acesso às áreas privadas
- ✅ Documentação completa

---

**Projeto:** MoneyUp  
**Autor:** Larissa Leona Sales e Joyce Vitória Camilo  
**Data:** 2026-08-23
