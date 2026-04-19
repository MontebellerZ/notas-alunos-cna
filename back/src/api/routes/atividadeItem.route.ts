import { Router } from "express";
import { BadRequestError } from "../errors/errors";
import {
  requireAtividadeAccessByBody,
  requireAtividadeAccessByBodyArray,
  requireAtividadeItemAccessByParam,
} from "../middleware/authorization.guard";
import atividadeItemService from "../services/atividadeItem.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const atividadeItemRoutes = Router();

atividadeItemRoutes.get("/", async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await atividadeItemService.getPaginated(page, limit, getUserCtx(req));
  res.send(result);
});

atividadeItemRoutes.post("/", requireAtividadeAccessByBody("atividadeId"), async (req, res) => {
  const result = await atividadeItemService.create(req.body);
  res.status(201).send(result);
});
atividadeItemRoutes.post("/lote", requireAtividadeAccessByBodyArray("itens", "atividadeId"), async (req, res) => {
  const { itens } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new BadRequestError("Lista de itens inválida.");
  }

  const result = await atividadeItemService.createMany(itens);
  res.status(201).send(result);
});

atividadeItemRoutes.use("/:id", requireAtividadeItemAccessByParam());

atividadeItemRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de atividade inválido.");

  const result = await atividadeItemService.getById(id);
  res.send(result);
});

atividadeItemRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de atividade inválido.");

  const result = await atividadeItemService.update({ ...req.body, id });
  res.send(result);
});

atividadeItemRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de atividade inválido.");

  const result = await atividadeItemService.delete(id);
  res.send(result);
});

export default atividadeItemRoutes;
