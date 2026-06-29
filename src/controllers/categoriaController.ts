import type { Request, Response } from "express";
import categoriaModel from "../models/categoriaModel.js";

const categoriaController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const dados = await categoriaModel.listar();
    res.status(200).json(dados);
  },
};

export default categoriaController;
