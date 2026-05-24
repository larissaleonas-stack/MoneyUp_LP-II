const botao = document.getElementById("salvarBtn");

botao.addEventListener("click", async () => {

  const nome = document.getElementById("nome").value;
  const valor = document.getElementById("valor").value;

  if(nome === "" || valor === ""){
    alert("Preencha todos os campos");
    return;
  }

  await fetch("http://localhost:3000/gastos", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      nome,
      valor
    })

  });

  window.location.href = "tela3.html";
});