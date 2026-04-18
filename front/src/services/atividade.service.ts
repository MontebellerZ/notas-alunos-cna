import type { TAtividade, TAtividadeCreate } from "../types/atividade.type";
import BaseService from "./base.service";

class AtividadeService extends BaseService {
  static async create(data: TAtividadeCreate): Promise<TAtividade> {
    return await this.post<TAtividade>("/atividade", data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/atividade/${id}`);
  }
}

export default AtividadeService;
