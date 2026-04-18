import turmaRepository from "../repositories/turma.repository";
import BaseService from "./base.service";

class TurmaService extends BaseService {
  constructor() {
    super(turmaRepository, "Turma");
  }
}

export default new TurmaService();
