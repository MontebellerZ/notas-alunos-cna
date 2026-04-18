import notaRepository from "../repositories/nota.repository";
import BaseService from "./base.service";

class NotaService extends BaseService {
  constructor() {
    super(notaRepository, "Nota");
  }
}

export default new NotaService();
