import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";

class NotaItemRepository extends BaseRepository {
  constructor() {
    super(prisma.notaItem as any);
  }

  async getAll(ctx?: UserCtx) {
    const where = {
      ativo: true,
      ...(ctx && !ctx.isAdmin
        ? { nota: { atividade: { turma: { usuarioId: ctx.usuarioId } } } }
        : {}),
    };
    return await prisma.notaItem.findMany({ where, orderBy: { id: "desc" } });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = {
      ativo: true,
      ...(ctx && !ctx.isAdmin
        ? { nota: { atividade: { turma: { usuarioId: ctx.usuarioId } } } }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.notaItem.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.notaItem.count({ where }),
    ]);
    return { items, total };
  }
}

export default new NotaItemRepository();
