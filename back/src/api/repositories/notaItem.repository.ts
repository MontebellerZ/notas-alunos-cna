import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class NotaItemRepository extends BaseRepository {
  constructor() {
    super(prisma.notaItem as any);
  }
}

export default new NotaItemRepository();
