import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import atividadeItemService from "../services/atividadeItem.service";

const atividadeItemRoutes = Router();

atividadeItemRoutes.get("/", async (req, res) => {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) ? pageRaw : undefined;
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const result = await atividadeItemService.getPaginated(page, limit);
  res.send(result);
});

atividadeItemRoutes.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de atividade inválido.");
  }

  const result = await atividadeItemService.getById(id);
  res.send(result);
});

atividadeItemRoutes.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de atividade inválido.");
  }

  const result = await atividadeItemService.update({ ...req.body, id });
  res.send(result);
});

atividadeItemRoutes.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    throw new BadRequestError("Id do item de atividade inválido.");
  }

  const result = await atividadeItemService.delete(id);
  res.send(result);
});

export default atividadeItemRoutes;
