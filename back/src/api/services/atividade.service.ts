import atividadeRepository from "../repositories/atividade.repository";
import { NotFoundError } from "../errors/errors";
import BaseService from "./base.service";
import type { UserCtx } from "../middleware/auth.middleware";
import Consts from "../../config/consts";

class AtividadeService extends BaseService {
  constructor() {
    super(atividadeRepository, "Atividade");
  }

  async getAll(ctx?: UserCtx) {
    return await atividadeRepository.getAll(ctx);
  }

  async getPaginated(page?: number, limit?: number, ctx?: UserCtx) {
    if (!page && !limit) {
      return await atividadeRepository.getAll(ctx);
    }
    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);
    const { items, total } = await atividadeRepository.getPaginated(page, limit, ctx);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { page, limit, total, totalPages, items };
  }

  async getByIdWithDetails(id: number) {
    return await atividadeRepository.getByIdWithDetails(id);
  }

  async getAvaliacaoData(id: number) {
    return await atividadeRepository.getAvaliacaoData(id);
  }

  async salvarAvaliacao(
    atividadeId: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[]
  ) {
    return await atividadeRepository.salvarAvaliacao(atividadeId, entradas);
  }

  async getRelatorio(id: number) {
    const relatorio = await atividadeRepository.getRelatorio(id);
    if (!relatorio) throw new NotFoundError("Atividade não encontrada.");
    return relatorio;
  }
}

export default new AtividadeService();
