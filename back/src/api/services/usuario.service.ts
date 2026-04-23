import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import CnaApi from "../../automate/cna/api";
import usuarioRepository from "../repositories/usuario.repository";
import envData from "../../config/envData";
import { BadRequestError, ForbiddenError, NotAuthorizedError } from "../errors/errors";
import { Usuario } from "@prisma/client";
import { AuthUsuario } from "../types/auth/authUsuario.type";
import StoragePaths from "../../config/storagePaths";

class UsuarioService {
  private sanitizeProfile(usuario: Usuario) {
    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      admin: usuario.admin,
      foto: usuario.foto ?? null,
    };
  }

  private generateToken(usuario: AuthUsuario) {
    const usuarioAuth: AuthUsuario = { id: usuario.id, email: usuario.email, admin: usuario.admin };

    const token = jwt.sign(usuarioAuth, envData.jwtSecret, { expiresIn: "7d" });

    return token;
  }

  private validarSenhaSegura(senha?: string | null): boolean {
    if (!senha || senha.trim().length < 6) {
      throw new BadRequestError("A senha deve ter ao menos 6 caracteres.");
    }

    return true;
  }

  private generateSenhaHash(senha: string): string {
    return bcrypt.hashSync(senha, 12);
  }

  private async removeOldPhotoIfLocal(fotoPath?: string | null) {
    if (!fotoPath || !StoragePaths.isManagedUploadPath(fotoPath)) return;

    try {
      await fs.unlink(StoragePaths.resolveStoredFileToDiskPath(fotoPath));
    } catch {
      // Ignora erro caso o arquivo não exista.
    }
  }

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
    const token = this.generateToken(usuario);

    return { usuario: this.sanitizeProfile(usuario), token };
  }

  async DefinirSenhaAdmin(id: number, novaSenha: string) {
    this.validarSenhaSegura(novaSenha);

    const hash = await bcrypt.hash(novaSenha, 12);
    return await usuarioRepository.updateSenha(id, hash);
  }

  async GetPerfil(id: number) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotAuthorizedError("Usuário não encontrado.");
    }

    return this.sanitizeProfile(usuario);
  }

  async AtualizarPerfil(
    auth: AuthUsuario,
    body: { nome?: string; email?: string; senha?: string; foto?: string | null },
  ) {
    const usuarioAtual = await usuarioRepository.findById(auth.id);
    if (!usuarioAtual) {
      throw new NotAuthorizedError("Usuário não encontrado.");
    }

    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    const foto = body.foto;
    const senha = body.senha;

    const data: {
      nome?: string | null;
      foto?: string | null;
      email?: string;
      senha?: string | null;
    } = {};

    if (email && email !== auth.email.toLowerCase()) {
      if (!auth.admin) {
        throw new ForbiddenError("Apenas administradores podem editar o email.");
      }

      const existente = await usuarioRepository.findByEmail(email);
      if (existente && existente.id !== auth.id) {
        throw new BadRequestError("Esse email já está em uso.");
      }

      data.email = email;
    }

    if (senha !== undefined) {
      if (!auth.admin) {
        throw new ForbiddenError("Apenas administradores podem editar a senha.");
      }

      this.validarSenhaSegura(senha);
      data.senha = this.generateSenhaHash(senha!);
    }

    if (nome !== undefined) {
      data.nome = nome ? nome : null;
    }

    if (foto !== undefined) {
      if (!foto) {
        data.foto = null;
        await this.removeOldPhotoIfLocal(usuarioAtual.foto);
      } else {
        data.foto = foto;
        if (usuarioAtual.foto && usuarioAtual.foto !== foto) {
          await this.removeOldPhotoIfLocal(usuarioAtual.foto);
        }
      }
    }

    const usuario = await usuarioRepository.updatePerfil(auth.id, data);
    const perfil = this.sanitizeProfile(usuario);
    const token = this.generateToken(perfil);

    return { usuario: perfil, token };
  }
}

export default new UsuarioService();
