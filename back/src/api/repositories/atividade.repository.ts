import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AtividadeRepository extends BaseRepository {
  constructor() {
    super(prisma.atividade as any);
  }

  async getByIdWithDetails(id: number) {
    return await prisma.atividade.findUnique({
      where: { id },
      include: {
        turma: { select: { id: true, nome: true } },
        atividadeItens: {
          where: { ativo: true },
          orderBy: { id: "asc" },
        },
      },
    });
  }
}

export default new AtividadeRepository();
