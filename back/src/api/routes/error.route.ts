import { NextFunction, Request, Response, Router } from "express";
import { HttpError } from "../errors/errors";

const errorRoutes = Router();

errorRoutes.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.code).send(err.message);
    return;
  }

  console.error(err);
  res.status(500).send("Erro inesperado");
});

export default errorRoutes;
