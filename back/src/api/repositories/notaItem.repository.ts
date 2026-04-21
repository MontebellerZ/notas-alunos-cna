import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeNotaItemWhere } from "./activeFilters";

class NotaItemRepository extends BaseRepository {
  constructor() {
    super(prisma.notaItem as any);
  }

  async getById(id: number) {
    return await prisma.notaItem.findFirst({
      where: { id, ...activeNotaItemWhere() },
    });
  }

  async getAll(ctx?: UserCtx) {
    const where = activeNotaItemWhere(ctx);
    return await prisma.notaItem.findMany({ where, orderBy: { id: "desc" } });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = activeNotaItemWhere(ctx);
    const [items, total] = await Promise.all([
      prisma.notaItem.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.notaItem.count({ where }),
    ]);
    return { items, total };
  }
}

export default new NotaItemRepository();
