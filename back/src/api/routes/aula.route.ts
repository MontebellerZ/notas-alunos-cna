import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import aulaService from "../services/aula.service";

const aulaRoutes = Router();

aulaRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await aulaService.getPaginated(page, limit);
  res.send(result);
});

aulaRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da aula inválido.");
  }

  const result = await aulaService.getById(id);
  res.send(result);
});

aulaRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da aula inválido.");
  }

  const result = await aulaService.update({ ...req.body, id });
  res.send(result);
});

aulaRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da aula inválido.");
  }

  const result = await aulaService.delete(id);
  res.send(result);
});

export default aulaRoutes;
