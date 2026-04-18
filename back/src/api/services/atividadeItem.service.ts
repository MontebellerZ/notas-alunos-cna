import atividadeItemRepository from "../repositories/atividadeItem.repository";
import BaseService from "./base.service";

class AtividadeItemService extends BaseService {
  constructor() {
    super(atividadeItemRepository, "AtividadeItem");
  }

  async createMany(data: { nome: string; peso: number; atividadeId: number }[]) {
    return await atividadeItemRepository.createMany(data);
  }
}

export default new AtividadeItemService();
