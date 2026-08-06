import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not catch rejected promises from async handlers — without
// this, an unexpected error (e.g. a DB failure) becomes an unhandled
// rejection instead of a safe 500 response.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
