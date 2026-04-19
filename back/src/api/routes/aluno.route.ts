import { Router } from "express";
import { requireAlunoAccessByParam } from "../middleware/authorization.guard";
import alunoService from "../services/aluno.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const alunoRoutes = Router();

alunoRoutes.get("/", async (req, res) => {
  const search = req.query.search as string | undefined;
  const ctx = getUserCtx(req);

  if (search !== undefined) {
    const result = await alunoService.searchByNome(search, ctx);
    res.send(result);
    return;
  }

  const { page, limit } = getPaginationParams(req);

  const result = await alunoService.getPaginated(page, limit, ctx);
  res.send(result);
});

alunoRoutes.post("/", async (req, res) => {
  const result = await alunoService.create(req.body);
  res.status(201).send(result);
});

alunoRoutes.use("/:id", requireAlunoAccessByParam());

alunoRoutes.get("/:id/historico", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do aluno inválido.");
  const result = await alunoService.getHistoricoNotas(id, getUserCtx(req));
  res.send(result);
});

alunoRoutes.get("/:id/detalhes", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do aluno inválido.");

  const result = await alunoService.getByIdWithDetails(id);
  res.send(result);
});

alunoRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do aluno inválido.");

  const result = await alunoService.getById(id);
  res.send(result);
});

alunoRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do aluno inválido.");

  const result = await alunoService.update({ ...req.body, id });
  res.send(result);
});

alunoRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do aluno inválido.");

  const result = await alunoService.delete(id);
  res.send(result);
});

export default alunoRoutes;
