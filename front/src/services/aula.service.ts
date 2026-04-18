import type { TAula } from "../types/aula.type";
import BaseService from "./base.service";

class AulaService extends BaseService {
  static async create(turmaId: number, data: { dia: string; horario: string }): Promise<TAula> {
    return await this.post<TAula>(`/turma/${turmaId}/aula`, data);
  }

  static async update(
    turmaId: number,
    aulaId: string,
    data: { dia: string; horario: string },
  ): Promise<TAula> {
    return await this.put<TAula>(`/turma/${turmaId}/aula/${aulaId}`, data);
  }

  static async remove(turmaId: number, aulaId: string): Promise<void> {
    return await this.delete<void>(`/turma/${turmaId}/aula/${aulaId}`);
  }
}

export default AulaService;

