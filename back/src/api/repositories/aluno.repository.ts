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
}

export default new AlunoRepository();
