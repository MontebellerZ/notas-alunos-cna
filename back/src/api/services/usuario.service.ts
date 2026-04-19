import jwt from "jsonwebtoken";
import CnaApi from "../../automate/cna/api";
import usuarioRepository from "../repositories/usuario.repository";
import envData from "../../config/envData";

class UsuarioService {
  async Login(email: string, senha: string) {
    await CnaApi.login(email, senha);

    const existente = await usuarioRepository.findByEmail(email);
    const usuario = existente ?? (await usuarioRepository.create(email));

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      envData.jwtSecret,
      { expiresIn: "7d" }
    );

    return { usuario, token };
  }
}

export default new UsuarioService();
