import type { TAtividadeItem, TAtividadeItemCreate } from "../types/atividadeItem.type";
import BaseService from "./base.service";

class AtividadeItemService extends BaseService {
  static async create(data: TAtividadeItemCreate): Promise<TAtividadeItem> {
    return await this.post<TAtividadeItem>("/atividade-item", data);
  }

  static async createBulk(itens: TAtividadeItemCreate[]): Promise<TAtividadeItem[]> {
    return await this.post<TAtividadeItem[]>("/atividade-item/lote", { itens });
  }

  static async update(id: number, data: Pick<TAtividadeItemCreate, "nome" | "peso">): Promise<TAtividadeItem> {
    return await this.put<TAtividadeItem>(`/atividade-item/${id}`, data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/atividade-item/${id}`);
  }
}

export default AtividadeItemService;
