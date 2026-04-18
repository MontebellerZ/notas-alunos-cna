import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AtividadeItemRepository extends BaseRepository {
  constructor() {
    super(prisma.atividadeItem as any);
  }

  async createMany(data: { nome: string; peso: number; atividadeId: number }[]) {
    return await prisma.$transaction(
      data.map((item) => prisma.atividadeItem.create({ data: item }))
    );
  }
}

export default new AtividadeItemRepository();
