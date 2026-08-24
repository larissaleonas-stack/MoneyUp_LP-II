const API_BASE = "http://localhost:3000/auth";

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida do servidor: ${text.slice(0, 200)}`);
  }
}

export async function register(nome, email, senha) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) throw data ?? { error: `Erro ${res.status}` };
  return data;
}

export async function login(email, senha) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) throw data ?? { error: `Erro ${res.status}` };

  if (!data || !data.token) {
    throw new Error("Resposta do login sem token");
  }

  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.href = "/frontend/login.html";
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export function getUser() {
  const v = sessionStorage.getItem("user");
  return v ? JSON.parse(v) : null;
}

export function authFetch(url, opts = {}) {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

export default { register, login, logout, getToken, getUser, authFetch };
