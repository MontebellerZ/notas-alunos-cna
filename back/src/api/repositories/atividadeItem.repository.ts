import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AtividadeItemRepository extends BaseRepository {
  constructor() {
    super(prisma.atividadeItem as any);
  }
}

export default new AtividadeItemRepository();
