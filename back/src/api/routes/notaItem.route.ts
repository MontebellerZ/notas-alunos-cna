import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import notaItemService from "../services/notaItem.service";

const notaItemRoutes = Router();

notaItemRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await notaItemService.getPaginated(page, limit);
  res.send(result);
});

notaItemRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de nota inválido.");
  }

  const result = await notaItemService.getById(id);
  res.send(result);
});

notaItemRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de nota inválido.");
  }

  const result = await notaItemService.update({ ...req.body, id });
  res.send(result);
});

notaItemRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de nota inválido.");
  }

  const result = await notaItemService.delete(id);
  res.send(result);
});

export default notaItemRoutes;
