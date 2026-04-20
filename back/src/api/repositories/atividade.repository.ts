import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";

function userFilter(ctx?: UserCtx) {
  return ctx && !ctx.isAdmin ? { turma: { usuarioId: ctx.usuarioId } } : {};
}

class AtividadeRepository extends BaseRepository {
  constructor() {
    super(prisma.atividade as any);
  }

  async getAll(ctx?: UserCtx) {
    return await prisma.atividade.findMany({
      where: { ativo: true, ...userFilter(ctx) },
      orderBy: { id: "desc" },
    });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = { ativo: true, ...userFilter(ctx) };
    const [items, total] = await Promise.all([
      prisma.atividade.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.atividade.count({ where }),
    ]);
    return { items, total };
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
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[],
    deletar: { alunoId: number; atividadeItemId: number }[] = []
  ) {
    return await prisma.$transaction(async (tx) => {
      const alunoIds = [...new Set([
        ...entradas.map((e) => e.alunoId),
        ...deletar.map((d) => d.alunoId),
      ])];

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

      // Soft-delete dos NotaItens removidos
      for (const d of deletar) {
        const nota = notaMap.get(d.alunoId);
        if (!nota) continue;
        const existente = await tx.notaItem.findFirst({
          where: { notaId: nota.id, atividadeItemId: d.atividadeItemId, ativo: true },
        });
        if (existente) {
          await tx.notaItem.update({
            where: { id: existente.id },
            data: { ativo: false },
          });
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

  async getRelatorio(id: number) {
    const atividade = await prisma.atividade.findUnique({
      where: { id },
      select: {
        id: true,
        capitulo: true,
        turma: {
          select: {
            id: true,
            nome: true,
            alunos: { where: { ativo: true }, select: { alunoId: true } },
          },
        },
        notas: {
          where: { ativo: true },
          select: { valor: true },
        },
      },
    });

    if (!atividade) return null;

    const totalAlunos = atividade.turma.alunos.length;
    const avaliados = atividade.notas.length;
    const pendentes = totalAlunos - avaliados;

    const valores = atividade.notas
      .map((n) => n.valor)
      .filter((v): v is number => v !== null);

    const media =
      valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    const min = valores.length > 0 ? Math.min(...valores) : null;
    const max = valores.length > 0 ? Math.max(...valores) : null;

    const faixas = [
      { label: "0 – 2", count: valores.filter((v) => v < 2).length },
      { label: "2 – 4", count: valores.filter((v) => v >= 2 && v < 4).length },
      { label: "4 – 6", count: valores.filter((v) => v >= 4 && v < 6).length },
      { label: "6 – 8", count: valores.filter((v) => v >= 6 && v < 8).length },
      { label: "8 – 10", count: valores.filter((v) => v >= 8).length },
    ];

    return {
      atividadeId: atividade.id,
      capitulo: atividade.capitulo,
      turmaId: atividade.turma.id,
      turmaNome: atividade.turma.nome,
      total: totalAlunos,
      avaliados,
      pendentes,
      media,
      min,
      max,
      faixas,
    };
  }
}

export default new AtividadeRepository();
