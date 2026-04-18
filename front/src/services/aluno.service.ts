import type { TAluno, TAlunoCreate, TAlunoDetalhe } from "../types/aluno.type";
import type { TPaginacao } from "../types/paginacao.type";
import BaseService from "./base.service";

class AlunoService extends BaseService {
  static async getPaginated(page: number, limit: number): Promise<TPaginacao<TAluno>> {
    return await this.get<TPaginacao<TAluno>>("/aluno", { params: { page, limit } });
  }

  static async search(nome: string): Promise<TAluno[]> {
    return await this.get<TAluno[]>("/aluno", { params: { search: nome } });
  }

  static async getByIdWithDetails(id: number): Promise<TAlunoDetalhe> {
    return await this.get<TAlunoDetalhe>(`/aluno/${id}/detalhes`);
  }

  static async create(data: TAlunoCreate): Promise<TAluno> {
    return await this.post<TAluno>("/aluno", data);
  }

  static async update(id: number, data: Partial<TAlunoCreate>): Promise<TAluno> {
    return await this.put<TAluno>(`/aluno/${id}`, data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/aluno/${id}`);
  }
}

export default AlunoService;

