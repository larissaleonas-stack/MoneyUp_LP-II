import type { Request, Response } from "express";
import gastoModel from "../models/gastoModel.js";
import type { GastoCreateInput, GastoUpdateInput } from "../types/gasto.js";
import { HttpError } from "../errors/HttpError.js";

const gastoController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const dados = await gastoModel.listar();
    res.status(200).json(dados);
  },

  async criar(req: Request, res: Response): Promise<void> {
    const data = req.body as GastoCreateInput;

    if (
      !data.nome ||
      data.valor === undefined ||
      !data.usuario ||
      data.categoriaId === undefined ||
      data.formaPagamentoId === undefined
    ) {
      throw new HttpError(400, "Missing required gasto fields");
    }

    const gasto = await gastoModel.criar(data);
    res.status(201).json(gasto);
  },

  async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new HttpError(400, "Invalid gasto id");
    }

    const data = req.body as GastoUpdateInput;
    const gasto = await gastoModel.atualizar(id, data);
    res.status(200).json(gasto);
  },

  async deletar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new HttpError(400, "Invalid gasto id");
    }

    await gastoModel.deletar(id);
    res.status(200).json({ mensagem: "Removido" });
  },
};

export default gastoController;
