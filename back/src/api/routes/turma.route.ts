import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import turmaService from "../services/turma.service";

const turmaRoutes = Router();

turmaRoutes.get("/agenda", async (_req, res) => {
  const result = await turmaService.getAgenda();
  res.send(result);
});

turmaRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await turmaService.getPaginated(page, limit);
  res.send(result);
});

turmaRoutes.post("/", async (req, res) => {
  const result = await turmaService.create(req.body);
  res.status(201).send(result);
});

turmaRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da turma inválido.");
  }

  const result = await turmaService.getById(id);
  res.send(result);
});

turmaRoutes.get("/:id/detalhes", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da turma inválido.");
  }

  const result = await turmaService.getByIdWithDetails(id);
  res.send(result);
});

turmaRoutes.post("/:id/aluno", async (req, res) => {
  const turmaId = Number(req.params.id);
  const alunoId = Number(req.body.alunoId);

  if (!Number.isFinite(turmaId)) {
    throw new BadRequestError("Id da turma inválido.");
  }
  if (!Number.isFinite(alunoId)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  const result = await turmaService.vincularAluno(turmaId, alunoId);
  res.status(201).send(result);
});

turmaRoutes.delete("/:id/aluno/:alunoId", async (req, res) => {
  const turmaId = Number(req.params.id);
  const alunoId = Number(req.params.alunoId);

  if (!Number.isFinite(turmaId)) {
    throw new BadRequestError("Id da turma inválido.");
  }
  if (!Number.isFinite(alunoId)) {
    throw new BadRequestError("Id do aluno inválido.");
  }

  await turmaService.desvincularAluno(turmaId, alunoId);
  res.send({ turmaId, alunoId, ativo: false });
});

turmaRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da turma inválido.");
  }

  const result = await turmaService.update({ ...req.body, id });
  res.send(result);
});

turmaRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da turma inválido.");
  }

  const result = await turmaService.delete(id);
  res.send(result);
});

// ── Aulas (dentro da turma) ──────────────────────────────────────
turmaRoutes.post("/:id/aula", async (req, res) => {
  const turmaId = Number(req.params.id);
  if (!Number.isFinite(turmaId)) throw new BadRequestError("Id da turma inválido.");

  const { dia, horario } = req.body as { dia?: string; horario?: string };
  if (!dia?.trim()) throw new BadRequestError("O campo 'dia' é obrigatório.");
  if (!horario?.trim()) throw new BadRequestError("O campo 'horario' é obrigatório.");

  const result = await turmaService.adicionarAula(turmaId, dia.trim(), horario.trim());
  res.status(201).send(result);
});

turmaRoutes.put("/:id/aula/:aulaId", async (req, res) => {
  const turmaId = Number(req.params.id);
  const { aulaId } = req.params;
  if (!Number.isFinite(turmaId)) throw new BadRequestError("Id da turma inválido.");
  if (!aulaId) throw new BadRequestError("Id da aula inválido.");

  const { dia, horario } = req.body as { dia?: string; horario?: string };
  if (!dia?.trim()) throw new BadRequestError("O campo 'dia' é obrigatório.");
  if (!horario?.trim()) throw new BadRequestError("O campo 'horario' é obrigatório.");

  const result = await turmaService.atualizarAula(turmaId, aulaId, dia.trim(), horario.trim());
  res.send(result);
});

turmaRoutes.delete("/:id/aula/:aulaId", async (req, res) => {
  const turmaId = Number(req.params.id);
  const { aulaId } = req.params;
  if (!Number.isFinite(turmaId)) throw new BadRequestError("Id da turma inválido.");
  if (!aulaId) throw new BadRequestError("Id da aula inválido.");

  const result = await turmaService.removerAula(turmaId, aulaId);
  res.send(result);
});

export default turmaRoutes;
