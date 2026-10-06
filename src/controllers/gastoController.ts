import type { Request, Response } from "express";
import gastoModel from "../models/gastoModel.js";
import type { GastoCreateInput, GastoUpdateInput } from "../types/gasto.js";
import { HttpError } from "../errors/HttpError.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

const gastoController = {
  async listar(_req: Request, res: Response): Promise<void> {
    const query = (res.locals.validated?.query ?? {}) as {
      page?: number;
      limit?: number;
    };
    const options =
      query.page !== undefined || query.limit !== undefined
        ? {
            skip: ((query.page ?? 1) - 1) * (query.limit ?? 20),
            take: query.limit ?? 20,
          }
        : undefined;
    const dados = await gastoModel.listar(options);
    res.status(200).json(dados);
  },

  async criar(req: AuthRequest, res: Response): Promise<void> {
    const data = req.body as Omit<GastoCreateInput, "usuario" | "usuarioId">;

    const gasto = await gastoModel.criar({ ...data, usuarioId: req.user!.id });
    res.status(201).json(gasto);
  },

  async atualizar(req: AuthRequest, res: Response): Promise<void> {
    const id = res.locals.validated.params.id as number;

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
    const id = res.locals.validated.params.id as number;

    const existente = await gastoModel.findById(id);
    if (!existente) throw new HttpError(404, "Gasto não encontrado");
    if (!req.user || req.user.id !== existente.usuario?.id)
      throw new HttpError(403, "Não autorizado");

    await gastoModel.deletar(id);
    res.status(200).json({ mensagem: "Removido" });
  },
};

export default gastoController;
