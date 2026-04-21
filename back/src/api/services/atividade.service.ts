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
    const atividade = await atividadeRepository.getByIdWithDetails(id);
    if (!atividade) throw new NotFoundError("Atividade não encontrada.");
    return atividade;
  }

  async getAvaliacaoData(id: number) {
    const atividade = await atividadeRepository.getAvaliacaoData(id);
    if (!atividade) throw new NotFoundError("Atividade não encontrada.");
    return atividade;
  }

  async salvarAvaliacao(
    atividadeId: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[],
    deletar: { alunoId: number; atividadeItemId: number }[] = []
  ) {
    const salvou = await atividadeRepository.salvarAvaliacao(atividadeId, entradas, deletar);
    if (!salvou) throw new NotFoundError("Atividade não encontrada.");
    return salvou;
  }

  async getRelatorio(id: number) {
    const relatorio = await atividadeRepository.getRelatorio(id);
    if (!relatorio) throw new NotFoundError("Atividade não encontrada.");
    return relatorio;
  }
}

export default new AtividadeService();
