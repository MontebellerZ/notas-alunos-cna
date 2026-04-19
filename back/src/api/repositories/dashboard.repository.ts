import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";

class DashboardRepository {
  async getDashboard(ctx?: UserCtx) {
    const turmaWhere = { ativo: true, ...(ctx && !ctx.isAdmin ? { usuarioId: ctx.usuarioId } : {}) };

    // 1. Totais simples
    const [totalTurmas, totalAlunos, totalAtividades] = await Promise.all([
      prisma.turma.count({ where: turmaWhere }),
      prisma.aluno.count({ where: { ativo: true } }),
      prisma.atividade.count({ where: { ativo: true, turma: turmaWhere } }),
    ]);

    // 2. Turmas com atividades e alunos vinculados
    const turmas = await prisma.turma.findMany({
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
          where: { ativo: true },
          select: { alunoId: true },
        },
      },
    });

    // 3. Notas avaliadas para os pares (aluno, atividade) relevantes
    const atividadeIds = turmas.flatMap((t) => t.atividades.map((a) => a.id));
    const alunoIds = turmas.flatMap((t) => t.alunos.map((a) => a.alunoId));

    const notas = await prisma.nota.findMany({
      where: { atividadeId: { in: atividadeIds }, alunoId: { in: alunoIds }, ativo: true },
      select: { atividadeId: true, alunoId: true, valor: true },
    });

    const notaSet = new Set(notas.map((n) => `${n.alunoId}-${n.atividadeId}`));

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
        const avaliadas = ids.filter((aid) => notaSet.has(`${aid}-${atv.id}`)).length;
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

