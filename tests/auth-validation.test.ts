import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app.js";

describe("Validação de cadastro", () => {
  it("rejeita e-mail em formato inválido", async () => {
    const res = await request(app).post("/auth/register").send({
      nome: "Teste",
      email: "email-invalido",
      senha: "SenhaSegura123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/e-mail|email/i);
    expect(res.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["body", "email"] }),
      ]),
    );
  });

  it("rejeita senha curta ou insegura", async () => {
    const res = await request(app).post("/auth/register").send({
      nome: "Teste",
      email: "teste@example.com",
      senha: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/senha|password/i);
  });

  it("rejeita query inválida antes de consultar gastos", async () => {
    const res = await request(app).get("/gastos?page=0");

    expect(res.status).toBe(400);
    expect(res.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["query", "page"] }),
      ]),
    );
  });

  it("aceita query de paginação válida", async () => {
    const res = await request(app).get("/gastos?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it("rejeita parâmetro de rota inválido antes da autenticação", async () => {
    const res = await request(app)
      .put("/gastos/nao-e-um-id")
      .set("Content-Type", "application/json")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["params", "id"] }),
      ]),
    );
  });
});
