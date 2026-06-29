import prisma from "../database/prisma.js";
import type { CategoriaResponse } from "../types/categoria.js";

const categoriaModel = {
  async listar(): Promise<CategoriaResponse[]> {
    return await prisma.categoria.findMany();
  },
};

export default categoriaModel;
