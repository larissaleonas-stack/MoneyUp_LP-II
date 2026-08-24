import fs from "fs";

const BASE = "http://localhost:3000";

async function waitForServer(timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(BASE + "/");
      if (res.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server did not start in time");
}

async function main() {
  console.log("Waiting for server...");
  await waitForServer();
  console.log("Server is up; running auth test");

  const email = `testuser_${Date.now()}@example.com`;
  const password = "Passw0rd!123";
  const user = { nome: "Auto Test", email, senha: password };

  try {
    const r1 = await fetch(BASE + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const body1 = await r1.text();
    console.log("Register status", r1.status, body1);
  } catch (err) {
    console.error("Register error", err);
  }

  try {
    const r2 = await fetch(BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    const json = await r2.json();
    console.log("Login status", r2.status, JSON.stringify(json));
    if (json.token) {
      const r3 = await fetch(BASE + "/me", {
        headers: { Authorization: `Bearer ${json.token}` },
      });
      const body3 = await r3.text();
      console.log("/me status", r3.status, body3);
    }
  } catch (err) {
    console.error("Login error", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
