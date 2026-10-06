import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validate(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    res.locals.validated = result.data;
    if ("body" in result.data) req.body = result.data.body;
    next();
  };
}
