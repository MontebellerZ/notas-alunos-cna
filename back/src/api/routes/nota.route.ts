import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import notaService from "../services/nota.service";

const notaRoutes = Router();

notaRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await notaService.getPaginated(page, limit);
  res.send(result);
});

notaRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da nota inválido.");
  }

  const result = await notaService.getById(id);
  res.send(result);
});

notaRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da nota inválido.");
  }

  const result = await notaService.update({ ...req.body, id });
  res.send(result);
});

notaRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id da nota inválido.");
  }

  const result = await notaService.delete(id);
  res.send(result);
});

export default notaRoutes;
