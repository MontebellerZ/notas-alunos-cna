import aulaRepository from "../repositories/aula.repository";
import BaseService from "./base.service";

class AulaService extends BaseService {
  constructor() {
    super(aulaRepository, "Aula");
  }
}

export default new AulaService();
