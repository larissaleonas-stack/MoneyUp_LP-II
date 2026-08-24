import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.post("/auth/register", asyncHandler(register));
router.post("/auth/login", asyncHandler(login));

export default router;
