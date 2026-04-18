import alunoRepository from "../repositories/aluno.repository";
import BaseService from "./base.service";

class AlunoService extends BaseService {
  constructor() {
    super(alunoRepository, "Aluno");
  }
}

export default new AlunoService();
