import { NextFunction, Request, Response, Router } from "express";
import usuarioRoutes from "./usuario.route";
import { HttpError } from "../errors/errors";
import turmaRoutes from "./turma.route";

const routes = Router();

routes.use("/turma", turmaRoutes);
routes.use("/usuario", usuarioRoutes);

routes.use("/", (req, res) => res.send(`[${req.method} ${req.originalUrl}] ✅ Alive`));

routes.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof HttpError) {
    res.status(err.code).send(err.message);
    return;
  }

  res.status(500).send("Erro inesperado");
});

export default routes;
