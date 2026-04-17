import type { TUsuario } from "../types/usuario.type";
import BaseService from "./base.service";

class UsuarioService extends BaseService {
  static async Login(email: string, senha: string): Promise<TUsuario> {
    const body = { email, senha };
    return await this.post<TUsuario>("/usuario/login", body);
  }
}

export default UsuarioService;
