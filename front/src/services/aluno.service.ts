import type { TAluno, TAlunoCreate } from "../types/aluno.type";
import BaseService from "./base.service";

class AlunoService extends BaseService {
  static async search(nome: string): Promise<TAluno[]> {
    return await this.get<TAluno[]>("/aluno", { params: { search: nome } });
  }

  static async create(data: TAlunoCreate): Promise<TAluno> {
    return await this.post<TAluno>("/aluno", data);
  }

  static async remove(id: number): Promise<void> {
    return await this.delete<void>(`/aluno/${id}`);
  }
}

export default AlunoService;
