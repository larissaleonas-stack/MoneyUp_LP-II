import GastoModel from "../models/gastoModel.js";

const GastoController = {

  listar(req, res){
    GastoModel.listar((erro, dados) => {

      if(erro){
        return res.status(500).json({ erro: erro.message });
      }

      res.status(200).json(dados);
    });
  },

  criar(req, res){

    const { nome, valor } = req.body;

    if(!nome || !valor){
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    GastoModel.criar(nome, valor, function(erro){

      if(erro){
        return res.status(500).json({ erro: erro.message });
      }

      res.status(201).json({
        id: this.lastID,
        nome,
        valor
      });
    });
 },

  atualizar(req, res){

    const id = req.params.id;
    const { nome, valor } = req.body;

    GastoModel.atualizar(id, nome, valor, function(erro){

      if(erro){
        return res.status(500).json({ erro: erro.message });
      }

      res.status(200).json({ mensagem: "Atualizado" });
    });
  },

  deletar(req, res){

    const id = req.params.id;

    GastoModel.deletar(id, function(erro){

      if(erro){
        return res.status(500).json({ erro: erro.message });
      }

      res.status(200).json({ mensagem: "Removido" });
    });
  }
};

export default GastoController;