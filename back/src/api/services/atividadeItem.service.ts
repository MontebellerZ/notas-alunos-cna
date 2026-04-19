import atividadeItemRepository from "../repositories/atividadeItem.repository";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class AtividadeItemService extends BaseService {
  constructor() {
    super(atividadeItemRepository, "AtividadeItem");
  }

  async getAll(ctx?: UserCtx) {
    return await atividadeItemRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) return await atividadeItemRepository.getAll(ctx);
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await atividadeItemRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }

  async createMany(data: { nome: string; peso: number; atividadeId: number }[]) {
    return await atividadeItemRepository.createMany(data);
  }
}

export default new AtividadeItemService();
