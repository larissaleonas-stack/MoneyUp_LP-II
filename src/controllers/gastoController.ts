import type { Request, Response } from "express";
import gastoModel from "../models/gastoModel.js";
import type { GastoCreateInput, GastoUpdateInput } from "../types/gasto.js";
import { HttpError } from "../errors/HttpError.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

const gastoController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const dados = await gastoModel.listar();
    res.status(200).json(dados);
  },

  async criar(req: AuthRequest, res: Response): Promise<void> {
    const data = req.body as GastoCreateInput;

    // if authenticated, associate gasto with authenticated user
    if (req.user && req.user.id) {
      (data as any).usuarioId = req.user.id;
    }

    if (
      !data.nome ||
      data.valor === undefined ||
      data.categoriaId === undefined ||
      data.formaPagamentoId === undefined ||
      (!data.usuario && !(data as any).usuarioId)
    ) {
      throw new HttpError(400, "Missing required gasto fields");
    }

    const gasto = await gastoModel.criar(data);
    res.status(201).json(gasto);
  },

  async atualizar(req: AuthRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new HttpError(400, "Invalid gasto id");
    }

    const data = req.body as GastoUpdateInput;

    // Ownership check
    const existente = await gastoModel.findById(id);
    if (!existente) throw new HttpError(404, "Gasto não encontrado");
    if (!req.user || req.user.id !== existente.usuario?.id)
      throw new HttpError(403, "Não autorizado");

    const gasto = await gastoModel.atualizar(id, data);
    res.status(200).json(gasto);
  },

  async deletar(req: AuthRequest, res: Response): Promise<void> {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new HttpError(400, "Invalid gasto id");
    }

    const existente = await gastoModel.findById(id);
    if (!existente) throw new HttpError(404, "Gasto não encontrado");
    if (!req.user || req.user.id !== existente.usuario?.id)
      throw new HttpError(403, "Não autorizado");

    await gastoModel.deletar(id);
    res.status(200).json({ mensagem: "Removido" });
  },
};

export default gastoController;
