import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CnaApi from "../../automate/cna/api";
import usuarioRepository from "../repositories/usuario.repository";
import envData from "../../config/envData";
import { NotAuthorizedError } from "../errors/errors";

class UsuarioService {
  async Login(email: string, senha: string) {
    const existente = await usuarioRepository.findByEmail(email);

    await CnaApi.login(email, senha).catch(async (err) => {
      if (!existente?.admin || !existente?.senha) throw err;

      const senhaCorreta = await bcrypt.compare(senha, existente.senha);
      if (!senhaCorreta) {
        throw new NotAuthorizedError("Credenciais inválidas.");
      }
    });

    const usuario = existente ?? (await usuarioRepository.create(email));

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, admin: usuario.admin },
      envData.jwtSecret,
      { expiresIn: "7d" },
    );

    return { usuario, token };
  }

  async DefinirSenhaAdmin(id: number, novaSenha: string) {
    const hash = await bcrypt.hash(novaSenha, 12);
    return await usuarioRepository.updateSenha(id, hash);
  }
}

export default new UsuarioService();
