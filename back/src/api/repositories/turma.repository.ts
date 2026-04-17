import { Turma } from "@prisma/client";
import prisma from "../../../prisma";

class TurmaRepository {
  static async GetAll() {
    return await prisma.turma.findMany({
      where: { ativo: true },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });
  }

  static async GetPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { ativo: true };

    const [items, total] = await prisma.$transaction([
      prisma.turma.findMany({
        where,
        orderBy: [{ date: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
      prisma.turma.count({ where }),
    ]);

    return { items, total };
  }

  static async UpdateById(id: number, turma: Partial<Turma>) {
    try {
      return await prisma.turma.update({ where: { id }, data: turma });
    } catch (e: any) {
      if (e?.code === "P2025") return null;
      throw e;
    }
  }

  static async DeleteById(id: number) {
    try {
      await prisma.turma.update({ where: { id }, data: { ativo: false } });
      return true;
    } catch (e: any) {
      if (e?.code === "P2025") return false;
      throw e;
    }
  }

  static async GetById(id: number) {
    return await prisma.turma.findUnique({ where: { id } });
  }
}

export default TurmaRepository;
