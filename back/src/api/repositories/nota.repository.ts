import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";

class NotaRepository extends BaseRepository {
  constructor() {
    super(prisma.nota as any);
  }

  async getAll(ctx?: UserCtx) {
    const where = {
      ativo: true,
      ...(ctx && !ctx.isAdmin ? { atividade: { turma: { usuarioId: ctx.usuarioId } } } : {}),
    };
    return await prisma.nota.findMany({ where, orderBy: { id: "desc" } });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = {
      ativo: true,
      ...(ctx && !ctx.isAdmin ? { atividade: { turma: { usuarioId: ctx.usuarioId } } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.nota.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.nota.count({ where }),
    ]);
    return { items, total };
  }
}

export default new NotaRepository();
