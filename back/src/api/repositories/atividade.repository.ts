import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AtividadeRepository extends BaseRepository {
  constructor() {
    super(prisma.atividade as any);
  }
}

export default new AtividadeRepository();
