import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeTurmaWhere } from "./activeFilters";

class DashboardRepository {
  async getDashboard(ctx?: UserCtx) {
    const turmaWhere = activeTurmaWhere(ctx);

    const [totalTurmas, totalAtividades, turmas] = await Promise.all([
      prisma.turma.count({ where: turmaWhere }),
      prisma.atividade.count({ where: { ativo: true, turma: turmaWhere } }),
      prisma.turma.findMany({
        where: turmaWhere,
        orderBy: { nome: "asc" },
        select: {
          id: true,
          nome: true,
          situacao: true,
          atividades: {
            where: { ativo: true },
            select: { id: true, capitulo: true },
          },
          alunos: {
            where: { ativo: true, aluno: { ativo: true } },
            select: { alunoId: true },
          },
        },
      }),
    ]);

    const totalAlunos = new Set(turmas.flatMap((turma) => turma.alunos.map((aluno) => aluno.alunoId))).size;

    const atividadeIds = turmas.flatMap((t) => t.atividades.map((a) => a.id));
    const alunoIds = turmas.flatMap((t) => t.alunos.map((a) => a.alunoId));

    const notas = await prisma.nota.findMany({
      where: {
        atividadeId: { in: atividadeIds },
        alunoId: { in: alunoIds },
        ativo: true,
        aluno: { ativo: true },
        atividade: { ativo: true, turma: turmaWhere },
      },
      select: {
        atividadeId: true,
        alunoId: true,
        valor: true,
        _count: { select: { notaItens: { where: { ativo: true, valor: { not: null } } } } },
      },
    });

    // total de itens ativos por atividade
    const atividadeItensCount = await prisma.atividadeItem.groupBy({
      by: ["atividadeId"],
      where: { atividadeId: { in: atividadeIds }, ativo: true },
      _count: { id: true },
    });
    const itensCountMap = new Map(atividadeItensCount.map((a) => [a.atividadeId, a._count.id]));

    // nota é considerada "avaliada sem pendências" apenas se todos os itens estiverem avaliados
    const avaliadaSet = new Set(
      notas
        .filter((n) => {
          const totalItens = itensCountMap.get(n.atividadeId) ?? 0;
          return totalItens === 0 || n._count.notaItens >= totalItens;
        })
        .map((n) => `${n.alunoId}-${n.atividadeId}`)
    );

    // Mapa atividadeId → lista de valores (para média)
    const valoresPorAtividade = new Map<number, number[]>();
    for (const nota of notas) {
      if (nota.valor !== null) {
        if (!valoresPorAtividade.has(nota.atividadeId)) {
          valoresPorAtividade.set(nota.atividadeId, []);
        }
        valoresPorAtividade.get(nota.atividadeId)!.push(nota.valor);
      }
    }

    // 4. Calcular progresso por turma e atividade
    let totalPendentes = 0;

    const progresso = turmas.map((turma) => {
      const ids = turma.alunos.map((a) => a.alunoId);

      const atividades = turma.atividades.map((atv) => {
        const total = ids.length;
        const avaliadas = ids.filter((aid) => avaliadaSet.has(`${aid}-${atv.id}`)).length;
        const pendentes = total - avaliadas;
        return { id: atv.id, capitulo: atv.capitulo, avaliadas, total, pendentes };
      });

      const total = ids.length * turma.atividades.length;
      const avaliadas = atividades.reduce((acc, a) => acc + a.avaliadas, 0);
      const pendentes = total - avaliadas;
      totalPendentes += pendentes;

      // Média das notas avaliadas desta turma
      const todosValores = turma.atividades.flatMap(
        (a) => valoresPorAtividade.get(a.id) ?? []
      );
      const media =
        todosValores.length > 0
          ? todosValores.reduce((acc, v) => acc + v, 0) / todosValores.length
          : null;

      return {
        id: turma.id,
        nome: turma.nome,
        situacao: turma.situacao,
        avaliadas,
        total,
        pendentes,
        media,
        atividades,
      };
    });

    return {
      totais: {
        turmas: totalTurmas,
        alunos: totalAlunos,
        atividades: totalAtividades,
        pendentes: totalPendentes,
      },
      progresso,
    };
  }
}

export default new DashboardRepository();

