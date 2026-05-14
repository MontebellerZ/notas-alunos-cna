import { NextFunction, Request, Response, Router } from "express";
import usuarioRoutes from "./usuario.route";
import { HttpError } from "../errors/errors";
import turmaRoutes from "./turma.route";
import alunoRoutes from "./aluno.route";
import atividadeRoutes from "./atividade.route";
import atividadeItemRoutes from "./atividadeItem.route";
import notaRoutes from "./nota.route";
import notaItemRoutes from "./notaItem.route";
import dashboardRoutes from "./dashboard.route";
import { authMiddleware } from "../middleware/auth.middleware";
import errorRoutes from "./error.route";

const routes = Router();

// Rota pública
routes.use("/usuario", usuarioRoutes);

// Rotas protegidas
routes.use(authMiddleware);
routes.use("/turma", turmaRoutes);
routes.use("/aluno", alunoRoutes);
routes.use("/atividade", atividadeRoutes);
routes.use("/atividade-item", atividadeItemRoutes);
routes.use("/nota", notaRoutes);
routes.use("/nota-item", notaItemRoutes);
routes.use("/dashboard", dashboardRoutes);

routes.use(errorRoutes);

export default routes;
