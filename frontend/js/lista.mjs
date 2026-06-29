const lista = document.getElementById("lista");

if (!lista) {
  throw new Error("Elemento de lista não foi encontrado");
}

const resposta = await fetch("http://localhost:3000/gastos");

if (!resposta.ok) {
  lista.innerHTML = `<p class="empty-message">Não foi possível carregar os gastos.</p>`;
  throw new Error("Erro ao buscar gastos");
}

const dados = await resposta.json();

if (!Array.isArray(dados) || dados.length === 0) {
  lista.innerHTML = `<p class="empty-message">Nenhum gasto registrado ainda. Crie um novo gasto para começar.</p>`;
} else {
  dados.forEach((gasto) => {
    const div = document.createElement("div");
    div.className = "expense-card";

    div.innerHTML = `
      <h3>${gasto.nome}</h3>
      <p>Valor: R$ ${gasto.valor}</p>
      <p>Usuário: ${gasto.usuario?.nome ?? "-"}</p>
      <div class="badges-row">
        <span class="badge">Categoria: ${gasto.categoria?.nome ?? "-"}</span>
        <span class="badge">Pagamento: ${gasto.formaPagamento?.nome ?? "-"}</span>
      </div>
      <div class="expense-actions">
        <button class="editar">Editar</button>
        <button class="excluir">Excluir</button>
      </div>
    `;

    const botaoEditar = div.querySelector(".editar");
    const botaoExcluir = div.querySelector(".excluir");

    botaoEditar?.addEventListener("click", () => {
      window.location.href = `tela2.html?id=${gasto.id}`;
    });

    botaoExcluir?.addEventListener("click", async () => {
      const confirmar = confirm("Deseja realmente excluir este gasto?");

      if (!confirmar) {
        return;
      }

      await fetch(`http://localhost:3000/gastos/${gasto.id}`, {
        method: "DELETE",
      });

      location.reload();
    });

    lista.appendChild(div);
  });
}
