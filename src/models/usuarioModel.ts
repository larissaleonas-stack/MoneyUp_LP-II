import prisma from "../database/prisma.js";
import type { UsuarioResponse } from "../types/usuario.js";

const usuarioModel = {
  async listar(): Promise<UsuarioResponse[]> {
    return await prisma.usuario.findMany();
  },
};

export default usuarioModel;
