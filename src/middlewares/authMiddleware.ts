import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma.js";
import { HttpError } from "../errors/HttpError.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const requireAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return next(new HttpError(401, "Token não fornecido"));
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
    });
    if (!user) return next(new HttpError(401, "Usuário inválido"));
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    return next(new HttpError(401, "Token inválido ou expirado"));
  }
};

export default requireAuth;
