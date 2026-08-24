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

**3. Cadastro e Autenticação (Controller)**

- Arquivo: src/controllers/authController.ts

```ts
export const register = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) throw new HttpError(400, "Dados incompletos");
  if (typeof senha !== "string" || senha.length < 8)
    throw new HttpError(400, "Senha muito curta");

  const existing = await usuarioModel.findByEmail(email);
  if (existing) throw new HttpError(409, "E-mail já cadastrado");

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const user = await usuarioModel.create({ nome, email, senhaHash });
  res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
};

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) throw new HttpError(400, "Dados incompletos");

  const user = await usuarioModel.findByEmail(email);
  if (!user) throw new HttpError(401, "Usuário ou senha inválidos");

  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) throw new HttpError(401, "Usuário ou senha inválidos");

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  res.json({
    token,
    user: { id: user.id, nome: user.nome, email: user.email },
  });
};
```

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
JWT_SECRET=uma-chave-secreta-muito-forte
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
PORT=3000
```

**8. Como executar (passo a passo)**n

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

Se quiser, eu posso também gerar um arquivo `.docx` contendo este conteúdo — deseja que eu gere e o adicione ao repositório?
