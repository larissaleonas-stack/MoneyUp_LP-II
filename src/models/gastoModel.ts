import prisma from "../database/prisma.js";
import type {
  GastoCreateInput,
  GastoUpdateInput,
  GastoResponse,
} from "../types/gasto.js";

const gastoModel = {
  async listar(): Promise<GastoResponse[]> {
    return await prisma.gasto.findMany({
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        categoria: true,
        formaPagamento: true,
      },
    });
  },

  async findById(id: number): Promise<GastoResponse | null> {
    return prisma.gasto.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        categoria: true,
        formaPagamento: true,
      },
    });
  },

  async criar(data: GastoCreateInput): Promise<GastoResponse> {
    if (!data.usuarioId) throw new Error("Authenticated user is required");

    return await prisma.gasto.create({
      data: {
        nome: data.nome,
        valor: data.valor,
        usuarioId: data.usuarioId,
        categoriaId: data.categoriaId,
        formaPagamentoId: data.formaPagamentoId,
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        categoria: true,
        formaPagamento: true,
      },
    });
  },

  async atualizar(id: number, data: GastoUpdateInput): Promise<GastoResponse> {
    return await prisma.gasto.update({
      where: { id },
      data: {
        nome: data.nome,
        valor: data.valor,
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        categoria: true,
        formaPagamento: true,
      },
    });
  },

  async deletar(id: number): Promise<void> {
    await prisma.gasto.delete({
      where: { id },
    });
  },
};

export default gastoModel;
