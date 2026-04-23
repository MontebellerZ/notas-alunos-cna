import { Usuario } from "@prisma/client";
import prisma from "../../../prisma";

class UsuarioRepository {
  async findById(id: number) {
    return await prisma.usuario.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await prisma.usuario.findFirst({
      where: { email: email.toLowerCase() },
    });
  }

  async create(email: string) {
    return await prisma.usuario.create({
      data: { email: email.toLowerCase() },
    });
  }

  async updateSenha(id: number, senhaHash: string) {
    return await prisma.usuario.update({
      where: { id },
      data: { senha: senhaHash },
    });
  }

  async updatePerfil(id: number, data: Partial<Usuario>) {
    return await prisma.usuario.update({
      where: { id },
      data,
    });
  }
}

export default new UsuarioRepository();
