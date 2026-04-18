import BaseRepository from "./base.repository";
import prisma from "../../../prisma";
import { randomUUID } from "crypto";

export interface AulaJson {
  id: string;
  dia: string;
  horario: string;
}

function parseAulas(aulasJson: string): AulaJson[] {
  try {
    return JSON.parse(aulasJson) as AulaJson[];
  } catch {
    return [];
  }
}

class TurmaRepository extends BaseRepository {
  constructor() {
    super(prisma.turma as any);
  }

  async getAll() {
    const turmas = await prisma.turma.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
    return turmas;
  }

  async getPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { ativo: true };
    const [items, total] = await Promise.all([
      prisma.turma.findMany({ where, orderBy: { nome: "asc" }, skip, take: limit }),
      prisma.turma.count({ where }),
    ]);
    return { items, total };
  }

  async getByIdWithDetails(id: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: {
          where: { ativo: true },
          include: { aluno: true },
          orderBy: { aluno: { nome: "asc" } },
        },
        atividades: { where: { ativo: true }, orderBy: { id: "asc" } },
      },
    });

    if (!turma) return null;

    const { aulasJson, ...rest } = turma;
    return { ...rest, aulas: parseAulas(aulasJson) };
  }

  async adicionarAula(turmaId: number, dia: string, horario: string) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) return null;

    const aulas = parseAulas(turma.aulasJson);
    const novaAula: AulaJson = { id: randomUUID(), dia, horario };
    aulas.push(novaAula);

    await prisma.turma.update({
      where: { id: turmaId },
      data: { aulasJson: JSON.stringify(aulas) },
    });

    return novaAula;
  }

  async atualizarAula(turmaId: number, aulaId: string, dia: string, horario: string) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) return null;

    const aulas = parseAulas(turma.aulasJson);
    const idx = aulas.findIndex((a) => a.id === aulaId);
    if (idx === -1) return null;

    aulas[idx] = { id: aulaId, dia, horario };

    await prisma.turma.update({
      where: { id: turmaId },
      data: { aulasJson: JSON.stringify(aulas) },
    });

    return aulas[idx];
  }

  async removerAula(turmaId: number, aulaId: string) {
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) return false;

    const aulas = parseAulas(turma.aulasJson);
    const novas = aulas.filter((a) => a.id !== aulaId);
    if (novas.length === aulas.length) return false;

    await prisma.turma.update({
      where: { id: turmaId },
      data: { aulasJson: JSON.stringify(novas) },
    });

    return true;
  }

  async vincularAluno(turmaId: number, alunoId: number) {
    return await prisma.turmaAluno.upsert({
      where: { turmaId_alunoId: { turmaId, alunoId } },
      update: { ativo: true },
      create: { turmaId, alunoId },
    });
  }

  async desvincularAluno(turmaId: number, alunoId: number) {
    return await prisma.turmaAluno.update({
      where: { turmaId_alunoId: { turmaId, alunoId } },
      data: { ativo: false },
    });
  }

  async getAgenda() {
    const turmas = await prisma.turma.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sala: true, situacao: true, aulasJson: true },
    });

    return turmas
      .map((t) => ({
        turmaId: t.id,
        nome: t.nome,
        sala: t.sala,
        situacao: t.situacao,
        aulas: parseAulas(t.aulasJson),
      }))
      .filter((t) => t.aulas.length > 0);
  }

  async getTurmaNotas(id: number) {
    const turma = await prisma.turma.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        atividades: {
          where: { ativo: true },
          orderBy: { id: "asc" },
          select: { id: true, capitulo: true, peso: true },
        },
        alunos: {
          where: { ativo: true },
          orderBy: { aluno: { nome: "asc" } },
          select: { aluno: { select: { id: true, nome: true } } },
        },
      },
    });

    if (!turma) return null;

    const atividadeIds = turma.atividades.map((a) => a.id);
    const alunoIds = turma.alunos.map((ta) => ta.aluno.id);

    const notas = await prisma.nota.findMany({
      where: { atividadeId: { in: atividadeIds }, alunoId: { in: alunoIds }, ativo: true },
      select: { alunoId: true, atividadeId: true, valor: true },
    });

    const notaMap = new Map<number, Map<number, number | null>>();
    for (const nota of notas) {
      if (!notaMap.has(nota.alunoId)) notaMap.set(nota.alunoId, new Map());
      notaMap.get(nota.alunoId)!.set(nota.atividadeId, nota.valor);
    }

    return {
      id: turma.id,
      nome: turma.nome,
      atividades: turma.atividades,
      alunos: turma.alunos.map(({ aluno }) => ({
        id: aluno.id,
        nome: aluno.nome,
        notas: turma.atividades.map((a) => {
          const alunoNotas = notaMap.get(aluno.id);
          const avaliada = alunoNotas?.has(a.id) ?? false;
          const valor = avaliada ? (alunoNotas!.get(a.id) ?? null) : null;
          return { atividadeId: a.id, valor, avaliada };
        }),
      })),
    };
  }
}

export default new TurmaRepository();
