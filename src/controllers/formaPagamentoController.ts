import type { Request, Response } from "express";
import formaPagamentoModel from "../models/formaPagamentoModel.js";

const formaPagamentoController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const dados = await formaPagamentoModel.listar();
    res.status(200).json(dados);
  },
};

export default formaPagamentoController;
