import alunoRepository from "../repositories/aluno.repository";
import { NotFoundError } from "../errors/errors";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class AlunoService extends BaseService {
  constructor() {
    super(alunoRepository, "Aluno");
  }

  async getAll(ctx?: UserCtx) {
    return await alunoRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) {
      return await alunoRepository.getAll(ctx);
    }
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await alunoRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }

  async searchByNome(nome: string, ctx?: UserCtx) {
    return await alunoRepository.searchByNome(nome, ctx);
  }

  async getByIdWithDetails(id: number) {
    const aluno = await alunoRepository.getByIdWithDetails(id);
    if (!aluno) throw new NotFoundError("Aluno não encontrado.");
    return aluno;
  }

  async getHistoricoNotas(id: number, ctx?: UserCtx) {
    const aluno = await alunoRepository.getById(id);
    if (!aluno) throw new NotFoundError("Aluno não encontrado.");
    return await alunoRepository.getHistoricoNotas(id, ctx);
  }
}

export default new AlunoService();
