import atividadeRepository from "../repositories/atividade.repository";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  constructor() {
    super(atividadeRepository, "Atividade");
  }

  async getByIdWithDetails(id: number) {
    return await atividadeRepository.getByIdWithDetails(id);
  }

  async getAvaliacaoData(id: number) {
    return await atividadeRepository.getAvaliacaoData(id);
  }

  async salvarAvaliacao(
    atividadeId: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[]
  ) {
    return await atividadeRepository.salvarAvaliacao(atividadeId, entradas);
  }
}

export default new AtividadeService();
