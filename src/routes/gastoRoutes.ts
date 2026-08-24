import { Router } from "express";
import gastoController from "../controllers/gastoController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/gastos", asyncHandler(gastoController.listar));
router.post("/gastos", requireAuth, asyncHandler(gastoController.criar));
router.put("/gastos/:id", requireAuth, asyncHandler(gastoController.atualizar));
router.delete(
  "/gastos/:id",
  requireAuth,
  asyncHandler(gastoController.deletar),
);

export default router;
