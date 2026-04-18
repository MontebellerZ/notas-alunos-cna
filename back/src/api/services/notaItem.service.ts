import notaItemRepository from "../repositories/notaItem.repository";
import BaseService from "./base.service";

class NotaItemService extends BaseService {
  constructor() {
    super(notaItemRepository, "NotaItem");
  }
}

export default new NotaItemService();
