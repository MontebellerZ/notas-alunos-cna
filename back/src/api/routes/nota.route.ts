import { Router } from "express";
import { requireNotaAccessByParam } from "../middleware/authorization.guard";
import notaService from "../services/nota.service";
import { getPaginationParams, getUserCtx, parseRequiredNumber } from "./route.utils";

const notaRoutes = Router();

notaRoutes.use("/:id", requireNotaAccessByParam());

notaRoutes.get("/", async (req, res) => {
  const { page, limit } = getPaginationParams(req);
  const result = await notaService.getPaginated(page, limit, getUserCtx(req));
  res.send(result);
});

notaRoutes.get("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da nota inválido.");

  const result = await notaService.getById(id);
  res.send(result);
});

notaRoutes.put("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da nota inválido.");

  const result = await notaService.update({ ...req.body, id });
  res.send(result);
});

notaRoutes.delete("/:id", async (req, res) => {
  const id = parseRequiredNumber(req.params.id, "Id da nota inválido.");

  const result = await notaService.delete(id);
  res.send(result);
});

export default notaRoutes;
