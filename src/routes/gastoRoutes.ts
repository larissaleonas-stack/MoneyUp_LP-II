import { Router } from "express";
import gastoController from "../controllers/gastoController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/gastos", asyncHandler(gastoController.listar));
router.post("/gastos", asyncHandler(gastoController.criar));
router.put("/gastos/:id", asyncHandler(gastoController.atualizar));
router.delete("/gastos/:id", asyncHandler(gastoController.deletar));

export default router;
