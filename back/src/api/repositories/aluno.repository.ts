import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AlunoRepository extends BaseRepository {
  constructor() {
    super(prisma.aluno as any);
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
          orderBy: { turmaId: "asc" },
        },
      },
    });
  }
}

export default new AlunoRepository();
