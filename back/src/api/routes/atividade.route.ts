import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import atividadeService from "../services/atividade.service";

const atividadeRoutes = Router();

atividadeRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await atividadeService.getPaginated(page, limit);
  res.send(result);
});

atividadeRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da atividade inválido.");
  }

  const result = await atividadeService.getById(id);
  res.send(result);
});

atividadeRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da atividade inválido.");
  }

  const result = await atividadeService.update({ ...req.body, id });
  res.send(result);
});

atividadeRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da atividade inválido.");
  }

  const result = await atividadeService.delete(id);
  res.send(result);
});

export default atividadeRoutes;
