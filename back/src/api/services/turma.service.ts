import turmaRepository from "../repositories/turma.repository";
import { BadRequestError, NotFoundError } from "../errors/errors";
import BaseService from "./base.service";

class TurmaService extends BaseService {
  constructor() {
    super(turmaRepository, "Turma");
  }

  async getByIdWithDetails(id: number) {
    const turma = await turmaRepository.getByIdWithDetails(id);
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
    return await turmaRepository.vincularAluno(turmaId, alunoId);
  }

  async desvincularAluno(turmaId: number, alunoId: number) {
    return await turmaRepository.desvincularAluno(turmaId, alunoId);
  }

  async getAgenda() {
    return await turmaRepository.getAgenda();
  }

  async getTurmaNotas(id: number) {
    const result = await turmaRepository.getTurmaNotas(id);
    if (!result) throw new NotFoundError("Turma não encontrada.");
    return result;
  }
}

export default new TurmaService();
