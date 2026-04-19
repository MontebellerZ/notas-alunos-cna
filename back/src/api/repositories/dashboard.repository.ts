import prisma from "../../../prisma";

class DashboardRepository {
  async getDashboard() {
    // 1. Totais simples
    const [totalTurmas, totalAlunos, totalAtividades] = await Promise.all([
      prisma.turma.count({ where: { ativo: true } }),
      prisma.aluno.count({ where: { ativo: true } }),
      prisma.atividade.count({ where: { ativo: true } }),
    ]);

    // 2. Turmas com atividades e alunos vinculados
    const turmas = await prisma.turma.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
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
      select: { atividadeId: true, alunoId: true },
    });

    const notaSet = new Set(notas.map((n) => `${n.alunoId}-${n.atividadeId}`));

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

      return { id: turma.id, nome: turma.nome, avaliadas, total, pendentes, atividades };
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
