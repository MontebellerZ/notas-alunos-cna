import type { TPaginacao } from "../types/paginacao.type";
import type { TTurma, TTurmaCreate } from "../types/turma.type";
import BaseService from "./base.service";

class TurmaService extends BaseService {
  static async getPaginated(page: number, limit: number): Promise<TPaginacao<TTurma>> {
    return await this.get<TPaginacao<TTurma>>("/turma", { params: { page, limit } });
  }

  static async create(data: TTurmaCreate): Promise<TTurma> {
    return await this.post<TTurma>("/turma", data);
  }

  static async update(id: number, data: Partial<TTurmaCreate>): Promise<TTurma> {
    return await this.put<TTurma>(`/turma/${id}`, data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/turma/${id}`);
  }
}

export default TurmaService;
