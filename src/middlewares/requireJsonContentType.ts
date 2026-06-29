import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError.js";

export function requireJsonContentType(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];

    if (
      !contentType ||
      typeof contentType !== "string" ||
      !contentType.includes("application/json")
    ) {
      throw new HttpError(
        415,
        "Content-Type must be application/json for POST and PUT requests",
      );
    }
  }

  next();
}
