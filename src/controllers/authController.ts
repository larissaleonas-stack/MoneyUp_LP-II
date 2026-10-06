import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usuarioModel from "../models/usuarioModel.js";
import { HttpError } from "../errors/HttpError.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

export const register = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body as {
    nome: string;
    email: string;
    senha: string;
  };

  const existing = await usuarioModel.findByEmail(email);
  if (existing) throw new HttpError(409, "E-mail já cadastrado", "email");

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const user = await usuarioModel.create({ nome, email, senhaHash });

  try {
    await sendWelcomeEmail(user.email, user.nome);
  } catch (error) {
    console.error("Falha no e-mail de boas-vindas; cadastro concluído.", error);
  }

  res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
};

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body as { email: string; senha: string };

  const user = await usuarioModel.findByEmail(email);
  if (!user) throw new HttpError(401, "Usuário ou senha inválidos");

  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) throw new HttpError(401, "Usuário ou senha inválidos");

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  res.json({
    token,
    user: { id: user.id, nome: user.nome, email: user.email },
  });
};

export default { register, login };
