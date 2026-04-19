import notaItemRepository from "../repositories/notaItem.repository";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class NotaItemService extends BaseService {
  constructor() {
    super(notaItemRepository, "NotaItem");
  }

  async getAll(ctx?: UserCtx) {
    return await notaItemRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) return await notaItemRepository.getAll(ctx);
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await notaItemRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }
}

export default new NotaItemService();
