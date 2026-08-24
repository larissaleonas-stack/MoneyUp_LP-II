import prisma from "../database/prisma.js";
import type { UsuarioResponse } from "../types/usuario.js";

const usuarioModel = {
  async listar(): Promise<UsuarioResponse[]> {
    return await prisma.usuario.findMany();
  },
  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },
  async findById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },
  async create(data: { nome: string; email: string; senhaHash: string }) {
    return prisma.usuario.create({ data });
  },
};

export default usuarioModel;
