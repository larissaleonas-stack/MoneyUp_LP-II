async function carregarGastos(){

  const resposta = await fetch("http://localhost:3000/gastos");

  const dados = await resposta.json();

  const lista = document.getElementById("lista");

  lista.innerHTML = "";

  dados.forEach(gasto => {

    const item = document.createElement("div");

    item.className = "gasto";

    item.innerHTML = `
      <span>
        ${gasto.nome} - R$ ${gasto.valor}
      </span>

      <button onclick="excluir(${gasto.id})">
        Excluir
      </button>
    `;

    lista.appendChild(item);
  });
}

window.excluir = async function(id){

  await fetch(`http://localhost:3000/gastos/${id}`, {

    method: "DELETE"

  });

  carregarGastos();
}

carregarGastos();