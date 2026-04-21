import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import type { UserCtx } from "../middleware/auth.middleware";
import { activeAtividadeWhere } from "./activeFilters";

class AtividadeRepository extends BaseRepository {
  constructor() {
    super(prisma.atividade as any);
  }

  async getById(id: number) {
    return await prisma.atividade.findFirst({
      where: { id, ...activeAtividadeWhere() },
    });
  }

  async getAll(ctx?: UserCtx) {
    return await prisma.atividade.findMany({
      where: activeAtividadeWhere(ctx),
      orderBy: { id: "desc" },
    });
  }

  async getPaginated(page: number, limit: number, ctx?: UserCtx) {
    const skip = (page - 1) * limit;
    const where = activeAtividadeWhere(ctx);
    const [items, total] = await Promise.all([
      prisma.atividade.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      prisma.atividade.count({ where }),
    ]);
    return { items, total };
  }

  async getByIdWithDetails(id: number) {
    return await prisma.atividade.findFirst({
      where: { id, ...activeAtividadeWhere() },
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
    const atividade = await prisma.atividade.findFirst({
      where: { id, ...activeAtividadeWhere() },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            alunos: {
              where: { ativo: true, aluno: { ativo: true } },
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
          where: { ativo: true, aluno: { ativo: true } },
          include: {
            notaItens: { where: { ativo: true, atividadeItem: { ativo: true } } },
          },
        },
      },
    });

    if (!atividade) return null;

    const alunoIdsAtivos = new Set(atividade.turma.alunos.map((turmaAluno) => turmaAluno.alunoId));

    return {
      ...atividade,
      notas: atividade.notas.filter((nota) => alunoIdsAtivos.has(nota.alunoId)),
    };
  }

  async salvarAvaliacao(
    atividadeId: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[],
    deletar: { alunoId: number; atividadeItemId: number }[] = []
  ) {
    return await prisma.$transaction(async (tx) => {
      const atividade = await tx.atividade.findFirst({
        where: { id: atividadeId, ...activeAtividadeWhere() },
        select: {
          turma: {
            select: {
              alunos: {
                where: { ativo: true, aluno: { ativo: true } },
                select: { alunoId: true },
              },
            },
          },
          atividadeItens: {
            where: { ativo: true },
            select: { id: true, peso: true },
          },
        },
      });

      if (!atividade) return false;

      const alunoIdsAtivos = new Set(atividade.turma.alunos.map((aluno) => aluno.alunoId));
      const atividadeItemIdsAtivos = new Set(atividade.atividadeItens.map((item) => item.id));

      const entradasAtivas = entradas.filter(
        (entrada) =>
          alunoIdsAtivos.has(entrada.alunoId) &&
          atividadeItemIdsAtivos.has(entrada.atividadeItemId)
      );
      const deletarAtivos = deletar.filter(
        (item) => alunoIdsAtivos.has(item.alunoId) && atividadeItemIdsAtivos.has(item.atividadeItemId)
      );

      const alunoIds = [...new Set([
        ...entradasAtivas.map((e) => e.alunoId),
        ...deletarAtivos.map((d) => d.alunoId),
      ])];

      if (alunoIds.length === 0) {
        return true;
      }

      const pesoMap = new Map(atividade.atividadeItens.map((item) => [item.id, item.peso]));
      const pesoTotal = atividade.atividadeItens.reduce((acc, item) => acc + item.peso, 0);

      const notasExistentes = await tx.nota.findMany({
        where: {
          atividadeId,
          alunoId: { in: alunoIds },
          ativo: true,
          aluno: { ativo: true },
        },
      });

      const notaMap = new Map(notasExistentes.map((n) => [n.alunoId, n]));

      for (const alunoId of alunoIds) {
        if (!notaMap.has(alunoId)) {
          const nova = await tx.nota.create({ data: { atividadeId, alunoId } });
          notaMap.set(alunoId, nova);
        }
      }

      for (const item of deletarAtivos) {
        const nota = notaMap.get(item.alunoId);
        if (!nota) continue;
        const existente = await tx.notaItem.findFirst({
          where: { notaId: nota.id, atividadeItemId: item.atividadeItemId, ativo: true },
        });
        if (existente) {
          await tx.notaItem.update({
            where: { id: existente.id },
            data: { ativo: false },
          });
        }
      }

      for (const entrada of entradasAtivas) {
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

      for (const [alunoId, nota] of notaMap) {
        const notaItens = await tx.notaItem.findMany({
          where: { notaId: nota.id, ativo: true, atividadeItem: { ativo: true } },
        });
        const soma = notaItens.reduce((acc, notaItem) => {
          const peso = pesoMap.get(notaItem.atividadeItemId) ?? 1;
          return acc + (notaItem.valor ?? 0) * peso;
        }, 0);
        const total = pesoTotal > 0 ? (soma / pesoTotal) * 10 : 0;
        await tx.nota.update({ where: { id: nota.id }, data: { valor: total } });
      }

      return true;
    });
  }

  async getRelatorio(id: number) {
    const atividade = await prisma.atividade.findFirst({
      where: { id, ...activeAtividadeWhere() },
      select: {
        id: true,
        capitulo: true,
        turma: {
          select: {
            id: true,
            nome: true,
            alunos: {
              where: { ativo: true, aluno: { ativo: true } },
              select: { alunoId: true },
            },
          },
        },
        notas: {
          where: { ativo: true, aluno: { ativo: true } },
          select: { alunoId: true, valor: true },
        },
      },
    });

    if (!atividade) return null;

    const alunoIdsAtivos = new Set(atividade.turma.alunos.map((aluno) => aluno.alunoId));
    const notasAtivas = atividade.notas.filter((nota) => alunoIdsAtivos.has(nota.alunoId));

    const totalAlunos = atividade.turma.alunos.length;
    const avaliados = notasAtivas.length;
    const pendentes = totalAlunos - avaliados;

    const valores = notasAtivas
      .map((nota) => nota.valor)
      .filter((valor): valor is number => valor !== null);

    const media =
      valores.length > 0 ? valores.reduce((acc, valor) => acc + valor, 0) / valores.length : null;
    const min = valores.length > 0 ? Math.min(...valores) : null;
    const max = valores.length > 0 ? Math.max(...valores) : null;

    const faixas = [
      { label: "0 – 2", count: valores.filter((valor) => valor < 2).length },
      { label: "2 – 4", count: valores.filter((valor) => valor >= 2 && valor < 4).length },
      { label: "4 – 6", count: valores.filter((valor) => valor >= 4 && valor < 6).length },
      { label: "6 – 8", count: valores.filter((valor) => valor >= 6 && valor < 8).length },
      { label: "8 – 10", count: valores.filter((valor) => valor >= 8).length },
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
