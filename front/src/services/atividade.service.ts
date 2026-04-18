import type { TAtividade, TAtividadeCreate, TAtividadeDetalhe } from "../types/atividade.type";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  static async create(data: TAtividadeCreate): Promise<TAtividade> {
    return await this.post<TAtividade>("/atividade", data);
  }

  static async getByIdWithDetails(id: number): Promise<TAtividadeDetalhe> {
    return await this.get<TAtividadeDetalhe>(`/atividade/${id}/detalhes`);
  }

  static async update(id: number, data: Partial<Pick<TAtividadeCreate, "capitulo" | "peso">>): Promise<TAtividade> {
    return await this.put<TAtividade>(`/atividade/${id}`, data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/atividade/${id}`);
  }
}

export default AtividadeService;
