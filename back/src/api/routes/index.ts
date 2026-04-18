import { NextFunction, Request, Response, Router } from "express";
import usuarioRoutes from "./usuario.route";
import { HttpError } from "../errors/errors";
import turmaRoutes from "./turma.route";
import aulaRoutes from "./aula.route";
import alunoRoutes from "./aluno.route";
import atividadeRoutes from "./atividade.route";
import atividadeItemRoutes from "./atividadeItem.route";
import notaRoutes from "./nota.route";
import notaItemRoutes from "./notaItem.route";

const routes = Router();

routes.use("/turma", turmaRoutes);
routes.use("/aula", aulaRoutes);
routes.use("/aluno", alunoRoutes);
routes.use("/atividade", atividadeRoutes);
routes.use("/atividade-item", atividadeItemRoutes);
routes.use("/nota", notaRoutes);
routes.use("/nota-item", notaItemRoutes);
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
