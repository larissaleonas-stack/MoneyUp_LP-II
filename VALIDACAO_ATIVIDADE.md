# Relatório da Atividade B3.2: Validação e Envio de E-mail

**Projeto:** MoneyUp  
**Disciplina:** Banco de Dados II  
**Data:** 2026-10-04  
**Pontuação:** 100 pontos

## 1. Schemas de Validação e Middleware Genérico (20 pontos)

A validação é feita com Zod, separada em schemas por responsabilidade. O middleware genérico `validate(schema)` recebe body, params e query, valida o conjunto indicado pela rota e interrompe a requisição antes do controller quando há erro.

Arquivos principais:

- `src/schemas/authSchemas.ts`
- `src/schemas/gastoSchemas.ts`
- `src/middlewares/validate.ts`
- `src/routes/authRoutes.ts`
- `src/routes/gastoRoutes.ts`

Exemplos de regras implementadas:

- cadastro: nome obrigatório, e-mail válido e senha com pelo menos 8 caracteres;
- gasto: nome obrigatório, valor positivo e IDs relacionados positivos;
- parâmetro `id`: inteiro positivo;
- query de listagem: `page` e `limit` devem ser inteiros positivos; `limit` é limitado a 100;
- os schemas normalizam valores textuais e numéricos antes de entregá-los aos controllers.

Os IDs do banco MoneyUp são inteiros autoincrementais no Prisma, não UUIDs. Por isso, a regra de rota valida inteiros positivos, de acordo com a modelagem existente.

Exemplo de declaração de rota:

```ts
router.post(
  "/auth/register",
  validate(registerRequestSchema),
  asyncHandler(register),
);
```

## 2. Respostas de Erro de Validação (20 pontos)

Erros do Zod são convertidos pelo middleware central `src/middlewares/errorHandler.ts` em `400 Bad Request`, com uma mensagem e uma lista de problemas contendo caminho e motivo:

```json
{
  "error": "Informe um e-mail válido",
  "issues": [
    {
      "path": ["body", "email"],
      "message": "Informe um e-mail válido"
    }
  ]
}
```

Códigos HTTP no projeto:

- `400 Bad Request`: body, parâmetro ou query inválidos, como e-mail fora do formato ou `page=0`;
- `404 Not Found`: gasto de ID válido que não existe, por exemplo ao atualizar/excluir;
- `409 Conflict`: e-mail já cadastrado. A resposta também identifica o campo `email`.

A validação de entrada fica no middleware de rota. Controllers continuam tratando decisões do fluxo, como duplicidade e recurso inexistente, e o middleware de erros padroniza as respostas.

## 3. Serviço de Envio de E-mail (20 pontos)

O envio está isolado em `src/services/emailService.ts`, usando Nodemailer. O serviço cria a mensagem em HTML e em texto simples; o controller e as rotas não importam Nodemailer.

Em desenvolvimento, `EMAIL_MODE=ethereal` cria uma conta de teste com `nodemailer.createTestAccount()`. Depois de enviar a mensagem, o serviço imprime no terminal a URL de prévia gerada por `nodemailer.getTestMessageUrl(info)`. Essa página mostra a mensagem de e-mail de teste; não é uma página hospedada pelo MoneyUp.

Para envio real, use `EMAIL_MODE=smtp` e configure variáveis no `.env` local. O `.env.example` contém somente valores de exemplo e não credenciais:

```env
EMAIL_MODE=ethereal
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=MoneyUp <no-reply@example.com>
```

O arquivo `.env` está excluído do Git. Credenciais reais não devem ser adicionadas ao repositório.

## 4. Integração do E-mail ao Fluxo e Testes (20 pontos)

O evento escolhido é o cadastro de usuário. Em `src/controllers/authController.ts`, a sequência é: validar a requisição na rota, verificar duplicidade, criar o usuário e então chamar `sendWelcomeEmail`.

Assim, cadastros inválidos ou duplicados não disparam o serviço de e-mail. Se o SMTP falhar, `emailService` registra o problema com `console.error` e retorna sem lançar a falha para a requisição; o cadastro concluído continua respondendo `201`.

Testes automatizados relevantes:

- `tests/auth-validation.test.ts`: e-mail inválido, senha curta, query inválida e parâmetro de rota inválido;
- `tests/gastos.test.ts`: cadastro com falha de SMTP continua em `201`, duplicidade retorna `409` sem novo envio e testes de integração de gastos.

O arquivo `requests.http` contém exemplos para REST Client: cadastro válido e duplicado, body inválido, parâmetro inválido, query inválida e query válida com paginação.

## 5. Validação e Retorno ao Usuário no Front-end (20 pontos)

Os formulários em `frontend/cadastro.html` e `frontend/login.html` usam validação nativa do HTML com `required`, `type="email"`, `pattern` e `minlength`.

No cadastro, JavaScript verifica a confirmação de senha com `setCustomValidity`. Quando a API retorna issues de validação ou informa que o e-mail já existe, a mensagem é associada ao controle correspondente e exibida com `reportValidity()`. Mensagens de sucesso e erro também aparecem em uma região acessível com `role="status"`.

A validação no navegador melhora o retorno imediato, mas não protege o sistema: o cliente pode ser alterado ou ignorado. As mesmas regras precisam existir na API para proteger o fluxo e as restrições do banco, como a unicidade do e-mail, preservam a integridade mesmo diante de requisições concorrentes.

## Execução e demonstração

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Para testar automaticamente:

```bash
npm run build
npx vitest run tests/auth-validation.test.ts tests/gastos.test.ts
```

Para a demonstração manual, executar as requisições da seção B3.2 em `requests.http`. No cadastro válido, observar o terminal e abrir a URL de prévia Ethereal que aparecer após o envio.

## Verificação realizada

Na verificação final, o build TypeScript passou e os dois arquivos de teste passaram, totalizando 14 testes. O teste de integração confirma que a falha SMTP não interrompe o cadastro e que o e-mail não é tentado quando o endereço já está cadastrado.

O fluxo Ethereal também foi demonstrado manualmente: o terminal imprimiu a URL de prévia e a mensagem foi aberta no navegador, mostrando o assunto, destinatário e conteúdo de boas-vindas em HTML. A versão em texto simples está disponível na aba correspondente da prévia.
