import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AlunoRepository extends BaseRepository {
  constructor() {
    super(prisma.aluno as any);
  }
}

export default new AlunoRepository();
