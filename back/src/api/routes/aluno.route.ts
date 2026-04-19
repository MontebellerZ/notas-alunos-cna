import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import alunoService from "../services/aluno.service";

const alunoRoutes = Router();

alunoRoutes.get("/", async (req, res) => {
  const search = req.query.search as string | undefined;

  if (search !== undefined) {
    const result = await alunoService.searchByNome(search);
    res.send(result);
    return;
  }

  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await alunoService.getPaginated(page, limit);
  res.send(result);
});

alunoRoutes.post("/", async (req, res) => {
  const result = await alunoService.create(req.body);
  res.status(201).send(result);
});

alunoRoutes.get("/:id/historico", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await alunoService.getHistoricoNotas(id);
  res.send(result);
});

alunoRoutes.get("/:id/detalhes", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await alunoService.getByIdWithDetails(id);
  res.send(result);
});

alunoRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await alunoService.getById(id);
  res.send(result);
});

alunoRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await alunoService.update({ ...req.body, id });
  res.send(result);
});

alunoRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await alunoService.delete(id);
  res.send(result);
});

export default alunoRoutes;
