import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeAtividadeItemWhere } from "./activeFilters";

class AtividadeItemRepository extends BaseRepository {
  constructor() {
    super(prisma.atividadeItem as any);
  }

  async getById(id: number) {
    return await prisma.atividadeItem.findFirst({
      where: { id, ...activeAtividadeItemWhere() },
    });
  }

  async getAll(ctx?: UserCtx) {
    const where = activeAtividadeItemWhere(ctx);
    return await prisma.atividadeItem.findMany({ where, orderBy: { id: "desc" } });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = activeAtividadeItemWhere(ctx);
    const [items, total] = await Promise.all([
      prisma.atividadeItem.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.atividadeItem.count({ where }),
    ]);
    return { items, total };
  }

  async createMany(data: { nome: string; peso: number; atividadeId: number }[]) {
    return await prisma.$transaction(
      data.map((item) => prisma.atividadeItem.create({ data: item }))
    );
  }
}

export default new AtividadeItemRepository();
