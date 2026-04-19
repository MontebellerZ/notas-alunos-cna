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
}

export default new UsuarioRepository();
