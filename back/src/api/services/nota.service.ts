import notaRepository from "../repositories/nota.repository";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class NotaService extends BaseService {
  constructor() {
    super(notaRepository, "Nota");
  }

  async getAll(ctx?: UserCtx) {
    return await notaRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) return await notaRepository.getAll(ctx);
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await notaRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }
}

export default new NotaService();
