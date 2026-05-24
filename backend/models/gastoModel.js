import db from "../database/database.js";

const GastoModel = {

  listar(callback){
    db.all("SELECT * FROM gastos", callback);
  },

  criar(nome, valor, callback){
    db.run(
      "INSERT INTO gastos(nome, valor) VALUES (?, ?)",
      [nome, valor],
      callback
    );
  },

  atualizar(id, nome, valor, callback){
    db.run(
      "UPDATE gastos SET nome = ?, valor = ? WHERE id = ?",
      [nome, valor, id],
      callback
    );
  },

  deletar(id, callback){
    db.run(
      "DELETE FROM gastos WHERE id = ?",
      [id],
      callback
    );
  }
};

export default GastoModel;