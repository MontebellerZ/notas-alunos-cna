import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeNotaWhere } from "./activeFilters";

class NotaRepository extends BaseRepository {
  constructor() {
    super(prisma.nota as any);
  }

  async getById(id: number) {
    return await prisma.nota.findFirst({
      where: { id, ...activeNotaWhere() },
    });
  }

  async getAll(ctx?: UserCtx) {
    const where = activeNotaWhere(ctx);
    return await prisma.nota.findMany({ where, orderBy: { id: "desc" } });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = activeNotaWhere(ctx);
    const [items, total] = await Promise.all([
      prisma.nota.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.nota.count({ where }),
    ]);
    return { items, total };
  }
}

export default new NotaRepository();
