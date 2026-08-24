# MoneyUp

Sistema de controle financeiro desenvolvido para a disciplina de Liguagem de Programção II, utilizando Node.js, Express.js, TypeScript, Prisma ORM e SQLite. O projeto inclui autenticação de usuários, geração de token JWT e proteção de rotas.

## Tecnologias Utilizadas

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- JWT (JSON Web Token)
- bcrypt
- HTML
- CSS
- JavaScript

## Estrutura do Projeto

- `src/` → controllers, models, routes, middlewares e servidor
- `frontend/` → páginas HTML e scripts JS para interface do usuário
- `prisma/` → schema do banco, migrations e seed
- `docs/` → documentação e diagramas
- `scripts/` → scripts auxiliares para testes e geração de documentação
- `tests/` → resultados de testes automáticos
- `requests.http` → testes manuais da API com REST Client

## Configuração do Projeto

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com o conteúdo abaixo:

```env
DATABASE_URL="file:./moneyup.db"
PORT=3000
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

### Gerar cliente Prisma

```bash
npx prisma generate
```

### Criar/aplicar banco

```bash
npx prisma db push
```

### Executar o projeto

```bash
npm run dev
```

Ou em modo normal:

```bash
npm start
```

A API ficará disponível em:

```txt
http://localhost:3000
```

## Funcionalidades

- Cadastro de usuários
- Login com autenticação
- Geração de token JWT
- Proteção de rotas autenticadas
- Cadastro, listagem, edição e exclusão de gastos
- Associação do gasto com o usuário autenticado
- Controle de autorização para edição/exclusão
- Integração com banco SQLite via Prisma
- Frontend simples com páginas de login e registro

## Autenticação

### Endpoints

- `POST /auth/register` → cadastra um usuário
- `POST /auth/login` → autentica e retorna token
- `GET /me` → retorna dados do usuário autenticado

### Como usar o token

Depois do login, o backend retorna um JWT no corpo da resposta. Envie esse valor no header:

```http
Authorization: Bearer <token>
```

## Rotas principais

### Usuários

- `GET /usuarios`
- `GET /me`

### Gastos

- `GET /gastos`
- `POST /gastos`
- `PUT /gastos/:id`
- `DELETE /gastos/:id`

### Categorias e formas de pagamento

- `GET /categorias`
- `GET /formas-pagamento`

## Testes

### Teste manual com REST Client

Abra o arquivo `requests.http` e execute as requisições em sequência:

1. Cadastro
2. Login
3. Uso do token em `/me`
4. Criação de gasto

### Script de autenticação automatizado

```bash
node scripts/test-auth-extended.mjs
```

Resultados salvos em:

```txt
tests/auth-results.txt
```

### Testes com Vitest

```bash
npm test
```

## Frontend

As páginas do projeto estão em `frontend/`:

- `index.html`
- `login.html`
- `cadastro.html`
- `tela2.html`
- `tela3.html`

Os scripts estão em `frontend/js/`:

- `auth.mjs` → login, logout e token
- `cadastro.mjs` → cadastro de gastos
- `lista.mjs` → listagem e exclusão

## Modelagem do Banco

O diagrama ERD está em:

```txt
docs/erd.mermaid
```

E a versão visual em:

```txt
docs/erd.jpeg
```

## Autores

- Larissa Leona Sales
- Joyce Vitória Camilo

## Observações

- O projeto foi evoluído para incluir autenticação de usuários e controle de acesso.
- O token JWT é usado para proteger recursos sensíveis da aplicação.
- O arquivo `requests.http` é a forma mais simples de testar a API manualmente.
- O projeto também possui testes automatizados para validar fluxo de autenticação e autorização.
