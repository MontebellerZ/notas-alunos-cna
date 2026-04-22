import prisma from "../../../prisma";

class UsuarioRepository {
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
}

export default new UsuarioRepository();
