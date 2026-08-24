import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/usuarios", asyncHandler(usuarioController.listar));
router.get("/me", requireAuth, (req, res) => {
  // @ts-ignore
  res.json({ user: req.user });
});

export default router;
