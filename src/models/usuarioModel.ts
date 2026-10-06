import prisma from "../database/prisma.js";
import type { UsuarioResponse } from "../types/usuario.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const usuarioModel = {
  async listar(): Promise<UsuarioResponse[]> {
    return await prisma.usuario.findMany();
  },
  async findByEmail(email: string) {
    const normalized = normalizeEmail(email);
    return prisma.usuario.findUnique({ where: { email: normalized } });
  },
  async findById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },
  async create(data: { nome: string; email: string; senhaHash: string }) {
    return prisma.usuario.create({
      data: {
        ...data,
        email: normalizeEmail(data.email),
      },
    });
  },
};

export default usuarioModel;
