import { Router } from "express";
import gastoController from "../controllers/gastoController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createGastoRequestSchema,
  gastoIdRequestSchema,
  gastoListRequestSchema,
  updateGastoRequestSchema,
} from "../schemas/gastoSchemas.js";

const router = Router();

router.get(
  "/gastos",
  validate(gastoListRequestSchema),
  asyncHandler(gastoController.listar),
);
router.post(
  "/gastos",
  validate(createGastoRequestSchema),
  requireAuth,
  asyncHandler(gastoController.criar),
);
router.put(
  "/gastos/:id",
  validate(updateGastoRequestSchema),
  requireAuth,
  asyncHandler(gastoController.atualizar),
);
router.delete(
  "/gastos/:id",
  validate(gastoIdRequestSchema),
  requireAuth,
  asyncHandler(gastoController.deletar),
);

export default router;
