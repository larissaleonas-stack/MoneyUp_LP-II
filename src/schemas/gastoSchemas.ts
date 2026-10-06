import { z } from "zod";

const positiveId = z.coerce
  .number()
  .int("Informe um número inteiro")
  .positive("O valor deve ser positivo");
const positiveAmount = z.coerce
  .number()
  .finite()
  .positive("O valor do gasto deve ser positivo");

export const gastoIdRequestSchema = z.object({
  params: z.object({ id: positiveId }),
});

export const gastoListRequestSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .regex(/^[1-9]\d*$/, "A página deve ser um inteiro positivo")
        .transform(Number)
        .optional(),
      limit: z
        .string()
        .regex(/^[1-9]\d*$/, "O limite deve ser um inteiro positivo")
        .transform(Number)
        .pipe(z.number().max(100, "O limite máximo é 100"))
        .optional(),
    })
    .strict(),
});

export const createGastoRequestSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(1, "Nome do gasto é obrigatório").max(100),
    valor: positiveAmount,
    categoriaId: positiveId,
    formaPagamentoId: positiveId,
  }),
});

export const updateGastoRequestSchema = z.object({
  ...gastoIdRequestSchema.shape,
  body: z
    .object({
      nome: z
        .string()
        .trim()
        .min(1, "Nome do gasto não pode ficar vazio")
        .max(100)
        .optional(),
      valor: positiveAmount.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "Informe ao menos um campo para atualizar",
    ),
});
