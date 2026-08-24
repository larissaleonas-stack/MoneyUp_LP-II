const botao = document.getElementById("salvarBtn");

if (!botao) {
  throw new Error("Botão de salvar não foi encontrado");
}

let selectedCategoriaId = null;
let selectedFormaPagamentoId = null;

async function carregarOpcoes() {
  try {
    showSpinner(true);
    showOptionsStatus("Carregando categorias e formas de pagamento...");

    const [catsRes, formasRes] = await Promise.all([
      fetch("http://localhost:3000/categorias"),
      fetch("http://localhost:3000/formas-pagamento"),
    ]);

    if (!catsRes.ok || !formasRes.ok) {
      showOptionsStatus(
        "Não foi possível carregar categorias ou formas de pagamento.",
        true,
      );
      console.warn("Não foi possível carregar categorias/formas de pagamento");
      return;
    }

    const categorias = await catsRes.json();
    const formas = await formasRes.json();

    const uniqueByName = (items) =>
      items.filter(
        (item, index, self) =>
          self.findIndex((other) => other.nome === item.nome) === index,
      );

    const categoriasUnicas = uniqueByName(categorias);
    const formasUnicas = uniqueByName(formas);

    const categoriaGroup = document.getElementById("categoriaGroup");
    const formaGroup = document.getElementById("formaGroup");
    const categoriaInput = document.getElementById("categoria");
    const formaInput = document.getElementById("formaPagamento");

    if (categoriaGroup && categoriaInput) {
      categoriaGroup.innerHTML = "";
      categoriasUnicas.forEach((c) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-pill";
        button.textContent = c.nome;
        button.dataset.id = String(c.id);

        button.addEventListener("click", () => {
          selectedCategoriaId = c.id;
          categoriaInput.value = String(c.id);
          categoriaGroup.querySelectorAll("button").forEach((item) => {
            item.classList.toggle("selected", item === button);
          });
        });

        categoriaGroup.appendChild(button);
      });
    }

    if (formaGroup && formaInput) {
      formaGroup.innerHTML = "";
      formasUnicas.forEach((f) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-pill";
        button.textContent = f.nome;
        button.dataset.id = String(f.id);

        button.addEventListener("click", () => {
          selectedFormaPagamentoId = f.id;
          formaInput.value = String(f.id);
          formaGroup.querySelectorAll("button").forEach((item) => {
            item.classList.toggle("selected", item === button);
          });
        });

        formaGroup.appendChild(button);
      });
    }

    showOptionsStatus("Categorias e formas carregadas. Selecione abaixo.");
    return { categorias, formas };
  } catch (err) {
    showOptionsStatus(
      "Não foi possível carregar categorias ou formas de pagamento.",
      true,
    );
    console.error("Erro ao carregar opções:", err);
  } finally {
    showSpinner(false);
  }
}

// Carrega opções ao abrir a página
const messageEl = document.getElementById("message");
const spinnerEl = document.getElementById("spinner");
const optionsStatusEl = document.getElementById("optionsStatus");

function showSpinner(show) {
  if (spinnerEl) spinnerEl.style.display = show ? "block" : "none";
}

function showMessage(text, isError = false) {
  if (!messageEl) return;
  messageEl.style.color = isError ? "red" : "green";
  messageEl.textContent = text;
}

function showOptionsStatus(text, isError = false) {
  if (!optionsStatusEl) return;
  optionsStatusEl.textContent = text;
  optionsStatusEl.style.color = isError ? "red" : "var(--muted)";
}

// Detecta modo de edição pela query string ?id=123
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");
let isEdit = false;

async function carregarParaEdicao(id) {
  try {
    showSpinner(true);
    const res = await authFetch("http://localhost:3000/gastos");
    if (!res.ok) return;
    const gastos = await res.json();
    const gasto = gastos.find((g) => String(g.id) === String(id));
    if (!gasto) return;

    document.getElementById("nome").value = gasto.nome;
    document.getElementById("valor").value = gasto.valor;
    document.getElementById("usuario").value = gasto.usuario?.nome ?? "";

    const { categorias, formas } = await carregarOpcoes();

    const categoriaButtons = document.querySelectorAll(
      "#categoriaGroup button",
    );
    const formaButtons = document.querySelectorAll("#formaGroup button");

    categoriaButtons.forEach((button) => {
      button.classList.toggle(
        "selected",
        String(button.dataset.id) === String(gasto.categoria?.id),
      );
    });

    formaButtons.forEach((button) => {
      button.classList.toggle(
        "selected",
        String(button.dataset.id) === String(gasto.formaPagamento?.id),
      );
    });

    selectedCategoriaId = gasto.categoria?.id ?? null;
    selectedFormaPagamentoId = gasto.formaPagamento?.id ?? null;
    const categoriaInput = document.getElementById("categoria");
    const formaInput = document.getElementById("formaPagamento");
    if (categoriaInput)
      categoriaInput.value = String(selectedCategoriaId ?? "");
    if (formaInput) formaInput.value = String(selectedFormaPagamentoId ?? "");
  } catch (err) {
    console.error(err);
  } finally {
    showSpinner(false);
  }
}

// Carrega opções e, se editId presente, carrega os dados do gasto
carregarOpcoes().then(() => {
  if (editId) {
    isEdit = true;
    carregarParaEdicao(editId);
    if (messageEl) messageEl.textContent = "Modo edição habilitado";
  }
});

import { authFetch, getUser } from "./auth.mjs";

botao.addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const valor = Number(document.getElementById("valor").value);
  const usuario = document.getElementById("usuario").value.trim();
  const categoriaId = Number(document.getElementById("categoria").value);
  const formaPagamentoId = Number(
    document.getElementById("formaPagamento").value,
  );

  if (
    !nome ||
    Number.isNaN(valor) ||
    !usuario ||
    Number.isNaN(categoriaId) ||
    Number.isNaN(formaPagamentoId) ||
    categoriaId <= 0 ||
    formaPagamentoId <= 0
  ) {
    showMessage("Preencha todos os campos corretamente", true);
    return;
  }

  try {
    showSpinner(true);
    const url = isEdit
      ? `http://localhost:3000/gastos/${editId}`
      : "http://localhost:3000/gastos";
    const method = isEdit ? "PUT" : "POST";

    // Use authenticated fetch so server associates gasto with logged user
    const response = await authFetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        valor,
        categoriaId,
        formaPagamentoId,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showMessage(data?.error ?? "Erro ao salvar gasto", true);
      return;
    }

    showMessage(
      isEdit ? "Gasto atualizado com sucesso" : "Gasto criado com sucesso",
    );
    setTimeout(() => {
      window.location.href = "tela3.html";
    }, 800);
  } catch (err) {
    console.error(err);
    showMessage("Erro inesperado", true);
  } finally {
    showSpinner(false);
  }
});
