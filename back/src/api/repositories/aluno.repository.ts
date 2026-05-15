import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeAlunoWhere, activeTurmaWhere } from "./activeFilters";

class AlunoRepository extends BaseRepository {
  constructor() {
    super(prisma.aluno as any);
  }

  async getAll(ctx?: UserCtx) {
    return await prisma.aluno.findMany({
      where: activeAlunoWhere(ctx),
      orderBy: { nome: "asc" },
    });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = activeAlunoWhere(ctx);
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({ where, orderBy: { nome: "asc" }, skip, take: limit }),
      prisma.aluno.count({ where }),
    ]);
    return { items, total };
  }

  async searchByNome(nome: string, ctx?: UserCtx) {
    return await prisma.aluno.findMany({
      where: { ...activeAlunoWhere(ctx), nome: { contains: nome } },
      orderBy: { nome: "asc" },
      take: 20,
    });
  }

  async getByIdWithDetails(id: number) {
    return await prisma.aluno.findFirst({
      where: { id, ativo: true },
      include: {
        turmas: {
          where: { ativo: true, turma: { ativo: true } },
          include: { turma: true },
          orderBy: { turma: { nome: "asc" } },
        },
      },
    });
  }

  async getHistoricoNotas(id: number, ctx?: UserCtx) {
    const turmaWhere = activeTurmaWhere(ctx);
    const turmaAlunos = await prisma.turmaAluno.findMany({
      where: { alunoId: id, ativo: true, aluno: { ativo: true }, turma: turmaWhere },
      orderBy: { turma: { nome: "asc" } },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            atividades: {
              where: { ativo: true },
              orderBy: { id: "asc" },
              select: {
                id: true,
                capitulo: true,
                valorTotal: true,
                atividadeItens: {
                  where: { ativo: true },
                  select: { id: true, peso: true },
                },
              },
            },
          },
        },
      },
    });

    const atividadeIds = turmaAlunos.flatMap((ta) => ta.turma.atividades.map((a) => a.id));

    const notas = atividadeIds.length
      ? await prisma.nota.findMany({
          where: {
            alunoId: id,
            atividadeId: { in: atividadeIds },
            ativo: true,
            aluno: { ativo: true },
            atividade: { ativo: true, turma: turmaWhere },
          },
          orderBy: { id: "desc" },
          select: {
            atividadeId: true,
            notaItens: {
              where: { ativo: true, atividadeItem: { ativo: true } },
              select: { atividadeItemId: true, valor: true },
            },
          },
        })
      : [];

    // Em caso de registros antigos duplicados, usa a nota ativa mais recente da atividade.
    const notaMap = new Map<number, (typeof notas)[number]>();
    for (const nota of notas) {
      if (!notaMap.has(nota.atividadeId)) {
        notaMap.set(nota.atividadeId, nota);
      }
    }

    const calcValor = (
      atividade: { valorTotal: number; atividadeItens: { id: number; peso: number }[] },
      nota: (typeof notas)[number] | undefined,
    ) => {
      if (!nota) return null;

      const pesoTotal = atividade.atividadeItens.reduce((acc, item) => acc + item.peso, 0);
      if (pesoTotal === 0) return 0;

      const notaItemMap = new Map(
        nota.notaItens.map((notaItem) => [notaItem.atividadeItemId, notaItem.valor ?? 0]),
      );

      const soma = atividade.atividadeItens.reduce((acc, item) => {
        const valor = notaItemMap.get(item.id) ?? 0;
        return acc + valor * item.peso;
      }, 0);

      return (soma / pesoTotal) * atividade.valorTotal;
    };

    return turmaAlunos.map(({ turma }) => {
      const atividades = turma.atividades.map((a) => ({
        atividadeId: a.id,
        capitulo: a.capitulo,
        valorTotal: a.valorTotal,
        avaliada: notaMap.has(a.id),
        valor: calcValor(a, notaMap.get(a.id)),
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
