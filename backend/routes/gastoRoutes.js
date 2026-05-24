import express from "express";
import GastoController from "../controllers/gastoController.js";

const router = express.Router();

router.get("/", GastoController.listar);
router.post("/", GastoController.criar);
router.put("/:id", GastoController.atualizar);
router.delete("/:id", GastoController.deletar);

export default router;