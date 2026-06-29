import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/usuarios", asyncHandler(usuarioController.listar));

export default router;
