import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AlunoRepository extends BaseRepository {
  constructor() {
    super(prisma.aluno as any);
  }

  async getAll() {
    return await prisma.aluno.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }

  async getPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { ativo: true };
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({ where, orderBy: { nome: "asc" }, skip, take: limit }),
      prisma.aluno.count({ where }),
    ]);
    return { items, total };
  }

  async searchByNome(nome: string) {
    return await prisma.aluno.findMany({
      where: {
        ativo: true,
        nome: { contains: nome },
      },
      orderBy: { nome: "asc" },
      take: 20,
    });
  }

  async getByIdWithDetails(id: number) {
    return await prisma.aluno.findUnique({
      where: { id },
      include: {
        turmas: {
          where: { ativo: true },
          include: { turma: true },
          orderBy: { turma: { nome: "asc" } },
        },
      },
    });
  }

  async getHistoricoNotas(id: number) {
    const turmaAlunos = await prisma.turmaAluno.findMany({
      where: { alunoId: id, ativo: true },
      orderBy: { turma: { nome: "asc" } },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            atividades: {
              where: { ativo: true },
              orderBy: { id: "asc" },
              select: { id: true, capitulo: true },
            },
          },
        },
      },
    });

    const atividadeIds = turmaAlunos.flatMap((ta) => ta.turma.atividades.map((a) => a.id));

    const notas = await prisma.nota.findMany({
      where: { alunoId: id, atividadeId: { in: atividadeIds }, ativo: true },
      select: { atividadeId: true, valor: true },
    });

    const notaMap = new Map(notas.map((n) => [n.atividadeId, n.valor]));

    return turmaAlunos.map(({ turma }) => {
      const atividades = turma.atividades.map((a) => ({
        atividadeId: a.id,
        capitulo: a.capitulo,
        avaliada: notaMap.has(a.id),
        valor: notaMap.has(a.id) ? (notaMap.get(a.id) ?? null) : null,
      }));

      const avaliadas = atividades.filter((a) => a.avaliada && a.valor !== null);
      const media =
        avaliadas.length > 0
          ? avaliadas.reduce((acc, a) => acc + a.valor!, 0) / avaliadas.length
          : null;

      return { turmaId: turma.id, turmaNome: turma.nome, atividades, media };
    });
  }
}

export default new AlunoRepository();
