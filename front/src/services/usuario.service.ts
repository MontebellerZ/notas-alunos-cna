import type { TLoginResponse } from "../types/usuario.type";
import BaseService from "./base.service";

class UsuarioService extends BaseService {
  static async Login(email: string, senha: string): Promise<TLoginResponse> {
    const body = { email, senha };
    return await this.post<TLoginResponse>("/usuario/login", body);
  }
}

export default UsuarioService;
