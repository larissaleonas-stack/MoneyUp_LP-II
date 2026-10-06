# Autenticação — MoneyUp

Este documento sumariza a implementação de autenticação do projeto, com trechos de código para inclusão em um arquivo DOCX.

**1. Modelagem de Usuários e Segurança das Credenciais**

- Arquivo: prisma/schema.prisma

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

- Observações: a senha nunca é armazenada em texto puro; apenas `senhaHash` (bcrypt). `email` tem restrição `@unique`.

**2. Model / DAO (TypeScript)**

- Arquivo: src/models/usuarioModel.ts

```ts
const usuarioModel = {
  async listar(): Promise<UsuarioResponse[]> {
    return await prisma.usuario.findMany();
  },
  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },
  async findById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },
  async create(data: { nome: string; email: string; senhaHash: string }) {
    return prisma.usuario.create({ data });
  },
};
```

**3. Cadastro, autenticação e validação (Controller e rotas)**

- Arquivos: `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, `src/schemas/authSchemas.ts`
- As rotas aplicam `validate(schema)` antes de chamar os controllers. Zod valida nome, e-mail e senha; o controller não repete verificações manuais de formato.
- Após validar e verificar duplicidade, o controller cria o usuário e chama o serviço isolado de e-mail.

```ts
router.post(
  "/auth/register",
  validate(registerRequestSchema),
  asyncHandler(register),
);
```

**3.1 Schemas e middleware genérico**

- Arquivos: `src/schemas/authSchemas.ts`, `src/schemas/gastoSchemas.ts`, `src/middlewares/validate.ts`
- Os schemas cobrem body de cadastro/login/gastos, parâmetro inteiro positivo `id`, e query de paginação `page`/`limit`.
- Valores numéricos de gastos devem ser positivos; `limit` tem máximo de 100. O ID é inteiro porque a modelagem Prisma usa autoincremento, não UUID.

**3.2 Erros de validação**

- Arquivo: `src/middlewares/errorHandler.ts`
- Zod retorna `400` com `issues`, cada uma contendo `path` e `message`. E-mail duplicado retorna `409`; gasto válido que não existe retorna `404`.

**3.3 E-mail de boas-vindas**

- Arquivo: `src/services/emailService.ts`
- `EMAIL_MODE=ethereal` cria uma conta temporária para desenvolvimento, envia HTML e texto puro e imprime no terminal a URL de prévia retornada por `nodemailer.getTestMessageUrl(info)`.
- A prévia Ethereal foi aberta durante a demonstração e mostrou o e-mail de boas-vindas do MoneyUp.
- Falhas do serviço são registradas no log sem derrubar o cadastro; e-mail duplicado é recusado antes da chamada ao serviço.

**4. Middleware de proteção (JWT)**

- Arquivo: src/middlewares/authMiddleware.ts

```ts
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

**5. Testes com REST Client (exemplo)**

- Arquivo: requests.http

```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nome": "Aluno Teste",
  "email": "aluno@exemplo.com",
  "senha": "SenhaSegura123"
}

POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "aluno@exemplo.com",
  "senha": "SenhaSegura123"
}

# After login, copy token and call:
GET http://localhost:3000/me
Authorization: Bearer <token>
```

**6. Front-end: integração mínima**

- Arquivo: frontend/js/auth.mjs (funções `register`, `login`, `logout`, `authFetch`)
- Arquivos: frontend/login.html, frontend/cadastro.html
- Proteção de rota: `frontend/tela2.html` verifica token e redireciona ao login se ausente.

Observação: a criação, atualização e exclusão de gastos (`POST/PUT/DELETE /gastos`) agora exigem autenticação; o servidor associa o gasto ao usuário autenticado (`usuarioId`). As rotas de listagem (`GET /gastos`) permanecem públicas para visualização.

**7. Variáveis de ambiente (arquivo .env)**

```
DATABASE_URL="file:./moneyup.db"
PORT=3000
JWT_SECRET=uma-chave-secreta-muito-forte
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
EMAIL_MODE=ethereal
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MoneyUp <no-reply@example.com>
```

Em desenvolvimento, `EMAIL_MODE=ethereal` usa uma conta temporária Nodemailer/Ethereal e imprime no terminal a URL de prévia da mensagem. Para envio real, configure `EMAIL_MODE=smtp` e credenciais apenas no `.env` local. Em testes, o envio é desabilitado.

**8. Como executar (passo a passo)**

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Observações de segurança**

- Nunca comitar `.env` em repositórios públicos.
- Use `JWT_SECRET` forte em produção e `https`.

---

## B3.2 - Validação e envio de e-mail

O estado atual da atividade está detalhado em `VALIDACAO_ATIVIDADE.md`. Schemas Zod para cadastro, login e gastos estão em `src/schemas/`; `src/middlewares/validate.ts` valida body, params e query antes do controller. O middleware de erros retorna `400` com `issues` contendo `path` e `message`.

O e-mail de boas-vindas é enviado por `src/services/emailService.ts` depois da criação do usuário. Falhas de SMTP são registradas e não mudam o `201` do cadastro. O arquivo `requests.http` inclui exemplos B3.2 de body, parâmetro e query inválidos, paginação válida, cadastro e duplicidade.
