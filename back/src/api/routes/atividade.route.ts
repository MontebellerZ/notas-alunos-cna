import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import { requireAtividadeAccessByParam, requireTurmaAccessByBody } from "../middleware/authorization.guard";
import atividadeService from "../services/atividade.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const atividadeRoutes = Router();

atividadeRoutes.get("/", async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await atividadeService.getPaginated(page, limit, getUserCtx(req));
  res.send(result);
});

atividadeRoutes.post("/", requireTurmaAccessByBody("turmaId"), async (req, res) => {
  const result = await atividadeService.create(req.body);
  res.status(201).send(result);
});

atividadeRoutes.use("/:id", requireAtividadeAccessByParam());

atividadeRoutes.get("/:id/relatorio", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.getRelatorio(id);
  res.send(result);
});

atividadeRoutes.get("/:id/detalhes", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.getByIdWithDetails(id);
  res.send(result);
});

atividadeRoutes.get("/:id/avaliacao", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.getAvaliacaoData(id);
  res.send(result);
});

atividadeRoutes.put("/:id/avaliacao", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const { entradas } = req.body;

  if (!Array.isArray(entradas)) {
    throw new BadRequestError("Campo 'entradas' deve ser um array.");
  }

  await atividadeService.salvarAvaliacao(id, entradas);
  res.send({ ok: true });
});

atividadeRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.getById(id);
  res.send(result);
});

atividadeRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.update({ ...req.body, id });
  res.send(result);
});

atividadeRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da atividade inválido.");

  const result = await atividadeService.delete(id);
  res.send(result);
});

export default atividadeRoutes;
