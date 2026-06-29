import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError.js";

type ErrorResponse = {
  error: string;
  code?: string;
  details?: unknown;
};

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // HttpError thrown by application code
  if (error instanceof HttpError) {
    const payload: ErrorResponse = { error: error.message };
    res.status(error.status).json(payload);
    return;
  }

  // Prisma known errors often include a `code` string like 'P2002' or 'P2003'
  // Map some common Prisma error codes to HTTP statuses with friendly messages
  try {
    const maybe = error as any;
    if (maybe && typeof maybe.code === "string") {
      const code: string = maybe.code;
      let status = 500;
      let message = maybe.message ?? "Database error";

      if (code === "P2002") {
        status = 409; // unique constraint
        message = "Resource conflict: unique constraint failed";
      } else if (code === "P2003") {
        status = 400; // foreign key constraint
        message = "Invalid related resource (foreign key constraint)";
      }

      const payload: ErrorResponse = { error: message, code };
      res.status(status).json(payload);
      return;
    }
  } catch (e) {
    // fallthrough
  }

  console.error(error);

  if (error instanceof Error) {
    const payload: ErrorResponse = { error: error.message };
    res.status(500).json(payload);
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
