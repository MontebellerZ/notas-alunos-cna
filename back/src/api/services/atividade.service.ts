import atividadeRepository from "../repositories/atividade.repository";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  constructor() {
    super(atividadeRepository, "Atividade");
  }
}

export default new AtividadeService();
