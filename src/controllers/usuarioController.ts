import type { Request, Response } from "express";
import usuarioModel from "../models/usuarioModel.js";

const usuarioController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const dados = await usuarioModel.listar();
    res.status(200).json(dados);
  },
};

export default usuarioController;
