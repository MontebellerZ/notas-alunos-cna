import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class NotaRepository extends BaseRepository {
  constructor() {
    super(prisma.nota as any);
  }
}

export default new NotaRepository();
