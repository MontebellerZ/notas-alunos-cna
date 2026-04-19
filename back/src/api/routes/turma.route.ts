import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import { requireTurmaAccessByParam } from "../middleware/authorization.guard";
import turmaService from "../services/turma.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const turmaRoutes = Router();

turmaRoutes.get("/agenda", async (req, res) => {
  const result = await turmaService.getAgenda(getUserCtx(req));
  res.send(result);
});

turmaRoutes.get("/", async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await turmaService.getPaginated(page, limit, getUserCtx(req));
  res.send(result);
});

turmaRoutes.post("/", async (req, res) => {
  const ctx = getUserCtx(req);
  const result = await turmaService.create({ ...req.body, usuarioId: ctx.usuarioId });
  res.status(201).send(result);
});

turmaRoutes.use("/:id", requireTurmaAccessByParam());

turmaRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da turma inválido.");

  const result = await turmaService.getById(id);
  res.send(result);
});

turmaRoutes.get("/:id/detalhes", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const result = await turmaService.getByIdWithDetails(id, getUserCtx(req));
  res.send(result);
});

turmaRoutes.get("/:id/notas", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const result = await turmaService.getTurmaNotas(id, getUserCtx(req));
  res.send(result);
});

turmaRoutes.post("/:id/aluno", async (req, res) => {
  const turmaId = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const alunoId = parseRequiredNumber(req.body.alunoId, "Id do aluno inválido.");

  const result = await turmaService.vincularAluno(turmaId, alunoId);
  res.status(201).send(result);
});

turmaRoutes.delete("/:id/aluno/:alunoId", async (req, res) => {
  const turmaId = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const alunoId = parseRequiredNumber(req.params.alunoId, "Id do aluno inválido.");

  await turmaService.desvincularAluno(turmaId, alunoId);
  res.send({ turmaId, alunoId, ativo: false });
});

turmaRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da turma inválido.");

  const result = await turmaService.update({ ...req.body, id });
  res.send(result);
});

turmaRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da turma inválido.");

  const result = await turmaService.delete(id);
  res.send(result);
});

// ── Aulas (dentro da turma) ──────────────────────────────────────
turmaRoutes.post("/:id/aula", async (req, res) => {
  const turmaId = parseRequiredNumber(req.params.id, "Id da turma inválido.");

  const { dia, horario } = req.body as { dia?: string; horario?: string };
  if (!dia?.trim()) throw new BadRequestError("O campo 'dia' é obrigatório.");
  if (!horario?.trim()) throw new BadRequestError("O campo 'horario' é obrigatório.");

  const result = await turmaService.adicionarAula(turmaId, dia.trim(), horario.trim());
  res.status(201).send(result);
});

turmaRoutes.put("/:id/aula/:aulaId", async (req, res) => {
  const turmaId = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const { aulaId } = req.params;
  if (!aulaId) throw new BadRequestError("Id da aula inválido.");

  const { dia, horario } = req.body as { dia?: string; horario?: string };
  if (!dia?.trim()) throw new BadRequestError("O campo 'dia' é obrigatório.");
  if (!horario?.trim()) throw new BadRequestError("O campo 'horario' é obrigatório.");

  const result = await turmaService.atualizarAula(turmaId, aulaId, dia.trim(), horario.trim());
  res.send(result);
});

turmaRoutes.delete("/:id/aula/:aulaId", async (req, res) => {
  const turmaId = parseRequiredNumber(req.params.id, "Id da turma inválido.");
  const { aulaId } = req.params;
  if (!aulaId) throw new BadRequestError("Id da aula inválido.");

  const result = await turmaService.removerAula(turmaId, aulaId);
  res.send(result);
});

export default turmaRoutes;
