import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import turmaService from "../services/turma.service";

const turmaRoutes = Router();

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

export default turmaRoutes;
