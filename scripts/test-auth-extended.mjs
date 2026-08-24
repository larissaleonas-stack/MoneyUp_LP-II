import fs from "fs/promises";

const BASE = "http://localhost:3000";
const results = [];

async function req(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, opts);
    const text = await res.text();
    return { status: res.status, body: text };
  } catch (e) {
    return { status: 0, body: String(e) };
  }
}

async function run() {
  const timestamp = new Date().toISOString();
  results.push(`Test run: ${timestamp}`);

  // 1) Register user A
  const emailA = `userA_${Date.now()}@example.com`;
  const passA = "SenhaValida123";
  results.push("\n1) Register user A");
  let r = await req("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "User A", email: emailA, senha: passA }),
  });
  results.push(JSON.stringify(r));

  // 2) Register duplicate (expect 409)
  results.push("\n2) Register duplicate user A (expect 409)");
  r = await req("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "User A", email: emailA, senha: passA }),
  });
  results.push(JSON.stringify(r));

  // 3) Login with invalid password (expect 401)
  results.push("\n3) Login invalid password (expect 401)");
  r = await req("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailA, senha: "wrongpass" }),
  });
  results.push(JSON.stringify(r));

  // 4) Login valid
  results.push("\n4) Login valid (expect 200)");
  r = await req("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailA, senha: passA }),
  });
  results.push(JSON.stringify(r));
  let tokenA = null;
  try {
    tokenA = JSON.parse(r.body).token;
  } catch (e) {}

  // 5) Access /me without token (expect 401)
  results.push("\n5) Access /me without token (expect 401)");
  r = await req("/me");
  results.push(JSON.stringify(r));

  // 6) Create gasto without token (expect 401)
  results.push("\n6) Create gasto without token (expect 401)");
  // fetch available categorias/formas
  const catsRes = await req("/categorias");
  const formasRes = await req("/formas-pagamento");
  let catId = 1;
  let formaId = 1;
  try {
    const cats = JSON.parse(catsRes.body);
    const formas = JSON.parse(formasRes.body);
    if (Array.isArray(cats) && cats.length) catId = cats[0].id;
    if (Array.isArray(formas) && formas.length) formaId = formas[0].id;
  } catch (e) {}

  r = await req("/gastos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Teste",
      valor: 10,
      categoriaId: catId,
      formaPagamentoId: formaId,
    }),
  });
  results.push(JSON.stringify(r));

  // 7) Create gasto with tokenA (expect 201)
  results.push("\n7) Create gasto with tokenA (expect 201)");
  r = await req("/gastos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      nome: "Gasto A",
      valor: 55,
      categoriaId: catId,
      formaPagamentoId: formaId,
    }),
  });
  results.push(JSON.stringify(r));
  let gastoId = null;
  try {
    gastoId = JSON.parse(r.body).id;
  } catch (e) {}

  // 8) Register user B and login
  const emailB = `userB_${Date.now()}@example.com`;
  const passB = "SenhaValida456";
  results.push("\n8) Register and login user B");
  r = await req("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: "User B", email: emailB, senha: passB }),
  });
  results.push(JSON.stringify(r));
  r = await req("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailB, senha: passB }),
  });
  results.push(JSON.stringify(r));
  let tokenB = null;
  try {
    tokenB = JSON.parse(r.body).token;
  } catch (e) {}

  // 9) User B attempts to delete gasto created by A (check behavior)
  results.push("\n9) User B attempts to delete gasto created by A");
  if (gastoId) {
    r = await req(`/gastos/${gastoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    results.push(JSON.stringify(r));
  } else {
    results.push("Skipped delete: gastoId not found");
  }

  // 10) User A tries to delete (cleanup)
  results.push("\n10) User A attempts to delete gasto (cleanup)");
  if (gastoId) {
    r = await req(`/gastos/${gastoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    results.push(JSON.stringify(r));
  } else {
    results.push("Skipped delete: gastoId not found");
  }

  // write results
  const out = results.join("\n");
  await fs.writeFile("tests/auth-results.txt", out);
  console.log("Wrote tests/auth-results.txt");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
