import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny, output } from "zod";

/** Route param that must be present; throws 400 if the URL is malformed. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (value === undefined) throw badRequest(`Missing route parameter "${name}".`);
  return value;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(msg = "Not found."): ApiError {
  return new ApiError(404, "not_found", msg);
}

export function badRequest(msg = "Bad request.", details?: unknown): ApiError {
  return new ApiError(400, "bad_request", msg, details);
}

/** Parses and returns the schema's *output* type, so `.default()` fields are present. */
export function zodParse<S extends ZodTypeAny>(schema: S, data: unknown): output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid payload.";
    throw badRequest(message, result.error.flatten());
  }
  return result.data;
}

/** Wraps a handler and turns thrown ApiError / ZodError into the envelope. */
export function wrap(
  fn: (req: Request, res: Response) => Promise<unknown>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  const zodErr = err as { name?: string; issues?: unknown };
  if (zodErr.name === "ZodError") {
    res.status(400).json({
      error: { code: "validation_error", message: "Validation failed.", details: zodErr.issues },
    });
    return;
  }
  console.error("[api] unhandled error:", err);
  res.status(500).json({ error: { code: "internal", message: "Something went wrong." } });
}

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>): void {
  res.json(meta ? { data, meta } : { data });
}
