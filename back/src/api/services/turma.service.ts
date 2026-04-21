import turmaRepository from "../repositories/turma.repository";
import { BadRequestError, NotFoundError } from "../errors/errors";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class TurmaService extends BaseService {
  constructor() {
    super(turmaRepository, "Turma");
  }

  async getAll(ctx?: UserCtx) {
    return await turmaRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) {
      return await turmaRepository.getAll(ctx);
    }
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await turmaRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }

  async getByIdWithDetails(id: number, ctx?: UserCtx) {
    const turma = await turmaRepository.getByIdWithDetails(id, ctx);
    if (!turma) throw new NotFoundError("Turma não encontrada.");
    return turma;
  }

  async adicionarAula(turmaId: number, dia: string, horario: string) {
    const aula = await turmaRepository.adicionarAula(turmaId, dia, horario);
    if (!aula) throw new NotFoundError("Turma não encontrada.");
    return aula;
  }

  async atualizarAula(turmaId: number, aulaId: string, dia: string, horario: string) {
    if (!dia || !horario) throw new BadRequestError("Dia e horário são obrigatórios.");
    const aula = await turmaRepository.atualizarAula(turmaId, aulaId, dia, horario);
    if (!aula) throw new NotFoundError("Aula não encontrada.");
    return aula;
  }

  async removerAula(turmaId: number, aulaId: string) {
    const ok = await turmaRepository.removerAula(turmaId, aulaId);
    if (!ok) throw new NotFoundError("Aula não encontrada.");
    return { aulaId, removida: true };
  }

  async vincularAluno(turmaId: number, alunoId: number) {
    const vinculo = await turmaRepository.vincularAluno(turmaId, alunoId);
    if (!vinculo) throw new NotFoundError("Turma ou aluno não encontrado.");
    return vinculo;
  }

  async desvincularAluno(turmaId: number, alunoId: number) {
    const vinculo = await turmaRepository.desvincularAluno(turmaId, alunoId);
    if (!vinculo) throw new NotFoundError("Vínculo não encontrado.");
    return vinculo;
  }

  async getAgenda(ctx?: UserCtx) {
    return await turmaRepository.getAgenda(ctx);
  }

  async getTurmaNotas(id: number, ctx?: UserCtx) {
    const result = await turmaRepository.getTurmaNotas(id, ctx);
    if (!result) throw new NotFoundError("Turma não encontrada.");
    return result;
  }
}

export default new TurmaService();
