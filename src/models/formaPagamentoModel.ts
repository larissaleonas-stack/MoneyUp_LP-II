import prisma from "../database/prisma.js";
import type { FormaPagamentoResponse } from "../types/formaPagamento.js";

const formaPagamentoModel = {
  async listar(): Promise<FormaPagamentoResponse[]> {
    return await prisma.formaPagamento.findMany();
  },
};

export default formaPagamentoModel;
