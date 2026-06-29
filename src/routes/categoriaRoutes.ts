import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/categorias", asyncHandler(categoriaController.listar));

export default router;
