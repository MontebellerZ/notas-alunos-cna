import alunoRepository from "../repositories/aluno.repository";
import { NotFoundError } from "../errors/errors";
import BaseService from "./base.service";

class AlunoService extends BaseService {
  constructor() {
    super(alunoRepository, "Aluno");
  }

  async searchByNome(nome: string) {
    return await alunoRepository.searchByNome(nome);
  }

  async getByIdWithDetails(id: number) {
    const aluno = await alunoRepository.getByIdWithDetails(id);
    if (!aluno) throw new NotFoundError("Aluno não encontrado.");
    return aluno;
  }

  async getHistoricoNotas(id: number) {
    const aluno = await alunoRepository.getById(id);
    if (!aluno) throw new NotFoundError("Aluno não encontrado.");
    return await alunoRepository.getHistoricoNotas(id);
  }
}

export default new AlunoService();
