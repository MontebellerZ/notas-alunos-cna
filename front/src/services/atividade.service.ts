import type { TAtividade, TAtividadeCreate, TAtividadeDetalhe, TAvaliacaoData, TAtividadeRelatorio } from "../types/atividade.type";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  static async create(data: TAtividadeCreate): Promise<TAtividade> {
    return await this.post<TAtividade>("/atividade", data);
  }

  static async getByIdWithDetails(id: number): Promise<TAtividadeDetalhe> {
    return await this.get<TAtividadeDetalhe>(`/atividade/${id}/detalhes`);
  }

  static async getAvaliacaoData(id: number): Promise<TAvaliacaoData> {
    return await this.get<TAvaliacaoData>(`/atividade/${id}/avaliacao`);
  }

  static async salvarAvaliacao(
    id: number,
    entradas: { alunoId: number; atividadeItemId: number; valor: number }[],
    deletar: { alunoId: number; atividadeItemId: number }[] = []
  ): Promise<void> {
    await this.put<void>(`/atividade/${id}/avaliacao`, { entradas, deletar });
  }

  static async getRelatorio(id: number): Promise<TAtividadeRelatorio> {
    return await this.get<TAtividadeRelatorio>(`/atividade/${id}/relatorio`);
  }

  static async update(id: number, data: Partial<Pick<TAtividadeCreate, "capitulo" | "peso" | "valorTotal">>): Promise<TAtividade> {
    return await this.put<TAtividade>(`/atividade/${id}`, data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/atividade/${id}`);
  }
}

export default AtividadeService;
