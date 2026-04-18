import BaseRepository from "./base.repository";
import prisma from "../../../prisma";

class AtividadeRepository extends BaseRepository {
  constructor() {
    super(prisma.atividade as any);
  }

  async getByIdWithDetails(id: number) {
    return await prisma.atividade.findUnique({
      where: { id },
      include: {
        turma: { select: { id: true, nome: true } },
        atividadeItens: {
          where: { ativo: true },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  async getAvaliacaoData(id: number) {
    const atividade = await prisma.atividade.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            alunos: {
              where: { ativo: true },
              include: { aluno: true },
              orderBy: { aluno: { nome: "asc" } },
            },
          },
        },
        atividadeItens: {
          where: { ativo: true },
          orderBy: { id: "asc" },
        },
        notas: {
          where: { ativo: true },
          include: {
            notaItens: { where: { ativo: true } },
          },
        },
      },
    });

    return atividade;
  }

  async salvarAvaliacao(
    atividadeId: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const alunoIds = [...new Set(entradas.map((e) => e.alunoId))];

      // Garantir que existe uma Nota para cada aluno
      const notasExistentes = await tx.nota.findMany({
        where: { atividadeId, alunoId: { in: alunoIds }, ativo: true },
      });

      const notaMap = new Map(notasExistentes.map((n) => [n.alunoId, n]));

      for (const alunoId of alunoIds) {
        if (!notaMap.has(alunoId)) {
          const nova = await tx.nota.create({ data: { atividadeId, alunoId } });
          notaMap.set(alunoId, nova);
        }
      }

      // Upsert de cada NotaItem
      for (const entrada of entradas) {
        const nota = notaMap.get(entrada.alunoId)!;
        const existente = await tx.notaItem.findFirst({
          where: { notaId: nota.id, atividadeItemId: entrada.atividadeItemId, ativo: true },
        });

        if (existente) {
          await tx.notaItem.update({
            where: { id: existente.id },
            data: { valor: entrada.valor },
          });
        } else {
          await tx.notaItem.create({
            data: { notaId: nota.id, atividadeItemId: entrada.atividadeItemId, valor: entrada.valor },
          });
        }
      }

      // Recalcular valor total de cada Nota (normalizado 0–10)
      const itens = await tx.atividadeItem.findMany({
        where: { atividadeId, ativo: true },
      });
      const pesoMap = new Map(itens.map((i) => [i.id, i.peso]));
      const pesoTotal = itens.reduce((acc, i) => acc + i.peso, 0);

      for (const [alunoId, nota] of notaMap) {
        const notaItens = await tx.notaItem.findMany({
          where: { notaId: nota.id, ativo: true },
        });
        const soma = notaItens.reduce((acc, ni) => {
          const peso = pesoMap.get(ni.atividadeItemId) ?? 1;
          return acc + (ni.valor ?? 0) * peso;
        }, 0);
        const total = pesoTotal > 0 ? (soma / pesoTotal) * 10 : 0;
        await tx.nota.update({ where: { id: nota.id }, data: { valor: total } });
      }

      return true;
    });
  }
}

export default new AtividadeRepository();
