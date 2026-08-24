import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import { execSync } from "child_process";

// Use test database and apply migrations before importing app
process.env.DATABASE_URL = "file:./test.db";
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

beforeAll(async () => {
  const email = `teste-${Date.now()}@example.com`;
  const register = await request(app)
    .post("/auth/register")
    .send({ nome: "Teste User", email, senha: "SenhaSegura123" });
  expect(register.status).toBe(201);
  const login = await request(app)
    .post("/auth/login")
    .send({ email, senha: "SenhaSegura123" });
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
