import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import {
  loginRequestSchema,
  registerRequestSchema,
} from "../schemas/authSchemas.js";

const router = Router();

router.post(
  "/auth/register",
  validate(registerRequestSchema),
  asyncHandler(register),
);
router.post("/auth/login", validate(loginRequestSchema), asyncHandler(login));

export default router;
