import type { TLoginResponse, TUsuario } from "../types/usuario.type";
import generateImageUrl from "../utils/generateImageUrl";
import BaseService from "./base.service";

class UsuarioService extends BaseService {
  static async Login(email: string, senha: string): Promise<TLoginResponse> {
    const body = { email, senha };
    return await this.post<TLoginResponse>("/usuario/login", body).then((res) => {
      res.usuario.foto = generateImageUrl(res.usuario.foto);
      return res;
    });
  }

  static async getMe(): Promise<TUsuario> {
    return await this.get<TUsuario>("/usuario/me").then((usuario) => {
      usuario.foto = generateImageUrl(usuario.foto);
      return usuario;
    });
  }

  static async updateMe(body: FormData): Promise<TLoginResponse> {
    return await this.put<TLoginResponse>("/usuario/me", body, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      res.usuario.foto = generateImageUrl(res.usuario.foto);
      return res;
    });
  }
}

export default UsuarioService;
