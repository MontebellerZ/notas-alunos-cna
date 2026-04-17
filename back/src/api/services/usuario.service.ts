import CnaApi from "../../automate/cna/api";
import BaseService from "./base.service";

class UsuarioService extends BaseService {
  static async Login(email: string, senha: string) {
    return await CnaApi.login(email, senha);
  }
}

export default UsuarioService;
