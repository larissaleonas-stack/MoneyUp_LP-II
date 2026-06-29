# MoneyUp

Sistema de controle financeiro desenvolvido para a disciplina de Banco de Dados II, utilizando Node.js, Express.js, Prisma ORM e SQLite.

## Tecnologias Utilizadas

- Node.js
- Express.js
- Prisma ORM
- SQLite
- HTML
- CSS
- JavaScript

## Estrutura do Projeto

- **src/** → Controllers, Models, Routes, Middlewares e configuração do servidor.
- **frontend/** → Interfaces HTML e scripts JavaScript.
- **prisma/** → Schema, migrations e configuração do banco.
- **docs/** → Documentação e diagrama ERD.
- **requests.http** → Testes da API utilizando REST Client.

## Configuração do Projeto

### Instalar dependências

```bash
npm install
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Criar banco de dados e aplicar migrations

```bash
npx prisma migrate dev --name init
```

### Popular banco com dados iniciais

```bash
npm run seed
```

### Executar servidor

```bash
npm start
```

Servidor disponível em:

```txt
http://localhost:3000
```

## Funcionalidades

- Cadastro de gastos
- Listagem de gastos
- Edição de gastos
- Remoção de gastos
- Integração com banco SQLite através do Prisma ORM
- Backend em TypeScript na pasta `src/`

## Modelagem do Banco

O diagrama ERD utilizado no projeto encontra-se em:

```txt
docs/erd.jpeg
```

O código-fonte Mermaid utilizado para gerar o diagrama encontra-se em:

```txt
docs/erd.mermaid
```

## Autoras

- Larissa Leona Sales
- Joyce Vitória Camilo

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

## Scripts úteis

- `npm run dev` — inicia em modo desenvolvimento com `tsx watch src/server.ts`
- `npm start` — inicia com `tsx src/server.ts`
- `npm run build` — compila TypeScript (`tsc`)
- `npm run seed` — executa o seeder do Prisma
- `npm test` — executa testes com Vitest

## Migrations e seed

Gerar e aplicar migrações locais (desenvolvimento):

```bash
npx prisma migrate dev --name init
```

Aplicar migrações em produção:

```bash
npx prisma migrate deploy
```

Para popular dados iniciais (seed):

```bash
npm run seed
```

## API (endpoints principais)

Base URL: `http://localhost:3000`

- `GET /gastos` — lista gastos (inclui `usuario`, `categoria`, `formaPagamento`)
- `POST /gastos` — cria gasto. Body JSON: `{ nome, valor, usuario, categoriaId, formaPagamentoId }`
- `PUT /gastos/:id` — atualiza nome/valor
- `DELETE /gastos/:id` — remove gasto

- `GET /usuarios` — lista usuários
- `GET /categorias` — lista categorias
- `GET /formas-pagamento` — lista formas de pagamento

Os endpoints `GET /categorias` e `GET /formas-pagamento` são usados pelo formulário de cadastro em `frontend/tela2.html`.

## Testes manuais com REST Client (VSCode)

Abra o arquivo `requests.http` na raiz e execute as requests para testar as rotas rapidamente.

## Frontend

Páginas estáticas em `frontend/`:

- `index.html` — home
- `tela2.html` — formulário de cadastro (usa `frontend/js/cadastro.mjs`)
- `tela3.html` — lista de gastos (usa `frontend/js/lista.mjs`)

Você pode abrir os arquivos diretamente no navegador ou usar um servidor estático.

Opções para servir o frontend:

```bash
cd frontend
npx http-server -p 5000
```

Em seguida acesse:

```txt
http://localhost:5000/index.html
```

## Observações

- O backend atual está em `src/`; a pasta `backend/` legada foi removida.
- A API retorna objetos relacionados (`usuario`, `categoria`, `formaPagamento`) em `GET /gastos`.
- O `tsconfig.json` inclui os testes e validação com TypeScript.
