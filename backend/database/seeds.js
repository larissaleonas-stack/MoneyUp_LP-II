import db from "./database.js";

db.serialize(() => {

  db.run(`
    INSERT INTO gastos(nome, valor)
    VALUES
    ('Internet', 100),
    ('Energia', 200),
    ('Mercado', 300)
  `);

  console.log("Dados inseridos com sucesso");
});