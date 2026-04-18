import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class TurmaRepository extends BaseRepository {
  constructor() {
    super(prisma.turma as any);
  }
}

export default new TurmaRepository();
