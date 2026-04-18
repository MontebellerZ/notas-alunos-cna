import alunoRepository from "../repositories/aluno.repository";
import BaseService from "./base.service";

class AlunoService extends BaseService {
  constructor() {
    super(alunoRepository, "Aluno");
  }

  async searchByNome(nome: string) {
    return await alunoRepository.searchByNome(nome);
  }
}

export default new AlunoService();
