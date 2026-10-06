import { z } from "zod";

const credentials = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .transform((email) => email.toLowerCase()),
  senha: z.string().trim().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const registerRequestSchema = z.object({
  body: credentials
    .extend({
      nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
    })
    .strict(),
});

export const loginRequestSchema = z.object({
  body: credentials,
});
