import db from "./database.js";

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      valor REAL NOT NULL
    )
  `);

  console.log("Tabela criada com sucesso");
});