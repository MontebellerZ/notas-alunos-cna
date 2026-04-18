import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AlunoRepository extends BaseRepository {
  constructor() {
    super(prisma.aluno as any);
  }

  async getAll() {
    return await prisma.aluno.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }

  async getPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { ativo: true };
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({ where, orderBy: { nome: "asc" }, skip, take: limit }),
      prisma.aluno.count({ where }),
    ]);
    return { items, total };
  }

  async searchByNome(nome: string) {
    return await prisma.aluno.findMany({
      where: {
        ativo: true,
        nome: { contains: nome },
      },
      orderBy: { nome: "asc" },
      take: 20,
    });
  }

  async getByIdWithDetails(id: number) {
    return await prisma.aluno.findUnique({
      where: { id },
      include: {
        turmas: {
          where: { ativo: true },
          include: { turma: true },
          orderBy: { turma: { nome: "asc" } },
        },
      },
    });
  }
}

export default new AlunoRepository();
