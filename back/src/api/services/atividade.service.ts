import atividadeRepository from "../repositories/atividade.repository";
import { NotFoundError } from "../errors/errors";
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

  async getRelatorio(id: number) {
    const relatorio = await atividadeRepository.getRelatorio(id);
    if (!relatorio) throw new NotFoundError("Atividade não encontrada.");
    return relatorio;
  }
}

export default new AtividadeService();
