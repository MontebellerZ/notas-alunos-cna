import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import { Turma } from "@prisma/client";
import TurmaService from "../services/turma.service";

const turmaRoutes = Router();

turmaRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await TurmaService.GetPaginated(page, limit);
  
  res.send(result);
});

turmaRoutes.put("/", async (req, res) => {
  const body = req.body as Turma;

  if (!Number.isFinite(body.id)) {
    throw new BadRequestError("Id da turma é obrigatório.");
  }

  const result = await TurmaService.Update(body);
  res.send(result);
});

turmaRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da turma inválido.");
  }

  const result = await TurmaService.Delete(id);
  res.send(result);
});

export default turmaRoutes;
