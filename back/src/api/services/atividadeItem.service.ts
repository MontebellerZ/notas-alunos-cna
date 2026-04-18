import atividadeItemRepository from "../repositories/atividadeItem.repository";
import BaseService from "./base.service";

class AtividadeItemService extends BaseService {
  constructor() {
    super(atividadeItemRepository, "AtividadeItem");
  }
}

export default new AtividadeItemService();
