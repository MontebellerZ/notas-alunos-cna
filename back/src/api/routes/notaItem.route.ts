import { Router } from "express";
import { requireNotaItemAccessByParam } from "../middleware/authorization.guard";
import notaItemService from "../services/notaItem.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const notaItemRoutes = Router();

notaItemRoutes.use("/:id", requireNotaItemAccessByParam());

notaItemRoutes.get("/", async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await notaItemService.getPaginated(page, limit, getUserCtx(req));
  res.send(result);
});

notaItemRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de nota inválido.");

  const result = await notaItemService.getById(id);
  res.send(result);
});

notaItemRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de nota inválido.");

  const result = await notaItemService.update({ ...req.body, id });
  res.send(result);
});

notaItemRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id do item de nota inválido.");

  const result = await notaItemService.delete(id);
  res.send(result);
});

export default notaItemRoutes;
