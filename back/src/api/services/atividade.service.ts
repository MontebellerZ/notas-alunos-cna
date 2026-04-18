import atividadeRepository from "../repositories/atividade.repository";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  constructor() {
    super(atividadeRepository, "Atividade");
  }

  async getByIdWithDetails(id: number) {
    return await atividadeRepository.getByIdWithDetails(id);
  }
}

export default new AtividadeService();
