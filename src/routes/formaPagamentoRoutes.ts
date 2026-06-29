import { Router } from "express";
import formaPagamentoController from "../controllers/formaPagamentoController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/formas-pagamento", asyncHandler(formaPagamentoController.listar));

export default router;
