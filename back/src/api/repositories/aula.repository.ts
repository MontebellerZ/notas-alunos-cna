import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AulaRepository extends BaseRepository {
  constructor() {
    super(prisma.aula as any);
  }
}

export default new AulaRepository();
