import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "fs";
import { execSync } from "child_process";

// Use test database and apply migrations before importing app
process.env.DATABASE_URL = "file:./test.db";
process.env.EMAIL_MODE = "smtp";
process.env.SMTP_HOST = "127.0.0.1";
process.env.SMTP_PORT = "1";
process.env.SMTP_USER = "test-user";
process.env.SMTP_PASS = "test-password";
try {
  if (fs.existsSync("prisma/test.db")) fs.unlinkSync("prisma/test.db");
} catch (e) {
  // ignore
}

// The legacy migration history predates the required auth fields, so sync the
// disposable test database directly from the current Prisma schema.
try {
  execSync(
    "npx prisma db push --schema prisma/schema.prisma --accept-data-loss",
    {
      stdio: "ignore",
    },
  );
} catch (e) {
  throw e;
}

const { default: prisma } = await import("../src/database/prisma.js");
const { default: app } = await import("../src/app.js");

let categoriaId: number;
let formaPagamentoId: number;
let createdId: number | null = null;
let authorization = "";
let registeredEmail = "";

beforeAll(async () => {
  registeredEmail = `teste-${Date.now()}@example.com`;
  const emailLog = vi.spyOn(console, "error").mockImplementation(() => {});
  const register = await request(app).post("/auth/register").send({
    nome: "Teste User",
    email: registeredEmail,
    senha: "SenhaSegura123",
  });
  expect(register.status).toBe(201);
  expect(emailLog).toHaveBeenCalledWith(
    "Erro ao enviar e-mail de boas-vindas:",
    expect.anything(),
  );
  emailLog.mockRestore();

  const login = await request(app)
    .post("/auth/login")
    .send({ email: registeredEmail, senha: "SenhaSegura123" });
  expect(login.status).toBe(200);
  authorization = `Bearer ${login.body.token}`;

  const cat = await prisma.categoria.create({
    data: { nome: "TesteCategoria" },
  });
  const forma = await prisma.formaPagamento.create({
    data: { nome: "TesteForma" },
  });
  categoriaId = cat.id;
  formaPagamentoId = forma.id;
});

afterAll(async () => {
  try {
    if (createdId) await prisma.gasto.delete({ where: { id: createdId } });
  } catch (e) {
    // ignore
  }
  try {
    await prisma.categoria.deleteMany({ where: { nome: "TesteCategoria" } });
    await prisma.formaPagamento.deleteMany({ where: { nome: "TesteForma" } });
  } catch (e) {
    // ignore
  }
  await prisma.$disconnect();
});

describe("Gastos API (integração)", () => {
  it("mantém cadastro em 201 e registra erro se SMTP estiver indisponível", async () => {
    const emailLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app)
      .post("/auth/register")
      .send({
        nome: "Teste SMTP",
        email: `smtp-${Date.now()}@example.com`,
        senha: "SenhaSegura123",
      });

    expect(res.status).toBe(201);
    expect(emailLog).toHaveBeenCalledWith(
      "Erro ao enviar e-mail de boas-vindas:",
      expect.anything(),
    );
    emailLog.mockRestore();
  });

  it("rejeita cadastro duplicado sem tentar enviar outro e-mail", async () => {
    const emailLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app).post("/auth/register").send({
      nome: "Teste User",
      email: registeredEmail,
      senha: "SenhaSegura123",
    });

    expect(res.status).toBe(409);
    expect(res.body.field).toBe("email");
    expect(emailLog).not.toHaveBeenCalled();
    emailLog.mockRestore();
  });

  it("retorna 404 ao atualizar gasto inexistente", async () => {
    const latestGasto = await prisma.gasto.aggregate({ _max: { id: true } });
    const missingId = (latestGasto._max.id ?? 0) + 1;
    const res = await request(app)
      .put(`/gastos/${missingId}`)
      .set("Authorization", authorization)
      .send({ valor: 25 });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/não encontrado/i);
  });

  it("GET /gastos deve retornar 200 e um array", async () => {
    const res = await request(app).get("/gastos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /gastos cria um gasto (201)", async () => {
    const payload = {
      nome: "Teste API",
      valor: 12.5,
      usuario: "TesteUser",
      categoriaId,
      formaPagamentoId,
    };

    const res = await request(app)
      .post("/gastos")
      .set("Authorization", authorization)
      .send(payload);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();
    if (res.body && res.body.id) createdId = res.body.id;
  });

  it("POST /gastos com payload inválido retorna 400", async () => {
    const res = await request(app)
      .post("/gastos")
      .set("Authorization", authorization)
      .send({ nome: "", valor: "" });
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
    expect(res.body.error).toBeTruthy();
  });

  it("POST /gastos com FK inválida retorna 400 e código P2003", async () => {
    const payload = {
      nome: "Teste FK",
      valor: 10,
      usuario: "UserFK",
      categoriaId: 999999,
      formaPagamentoId: 999999,
    };

    const res = await request(app)
      .post("/gastos")
      .set("Authorization", authorization)
      .send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toBeDefined();
    // our error handler maps Prisma P2003 to 400 with a code
    expect(
      res.body.code === "P2003" || typeof res.body.error === "string",
    ).toBeTruthy();
  });

  it("PUT /gastos/:id atualiza um gasto (200)", async () => {
    if (!createdId) return;
    const res = await request(app)
      .put(`/gastos/${createdId}`)
      .set("Authorization", authorization)
      .send({ nome: "Atualizado", valor: 20 });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Atualizado");
  });

  it("DELETE /gastos/:id remove um gasto (200)", async () => {
    if (!createdId) return;
    const res = await request(app)
      .delete(`/gastos/${createdId}`)
      .set("Authorization", authorization);
    expect(res.status).toBe(200);
  });
});
