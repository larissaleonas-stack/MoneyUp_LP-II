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
        usuario: true,
        categoria: true,
        formaPagamento: true,
      },
    });
  },

  async criar(data: GastoCreateInput): Promise<GastoResponse> {
    let usuarioExistente = await prisma.usuario.findFirst({
      where: {
        nome: data.usuario,
      },
    });

    if (!usuarioExistente) {
      usuarioExistente = await prisma.usuario.create({
        data: {
          nome: data.usuario,
        },
      });
    }

    return await prisma.gasto.create({
      data: {
        nome: data.nome,
        valor: data.valor,
        usuarioId: usuarioExistente.id,
        categoriaId: data.categoriaId,
        formaPagamentoId: data.formaPagamentoId,
      },
      include: {
        usuario: true,
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
        usuario: true,
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
