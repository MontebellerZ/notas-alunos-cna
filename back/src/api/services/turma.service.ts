import { BadRequestError, NotFoundError } from "../errors/errors";
import TurmaRepository from "../repositories/turma.repository";
import BaseService from "./base.service";
import { Turma } from "@prisma/client";
import Consts from "../../config/consts";

class TurmaService extends BaseService {
  static async GetAll() {
    return await TurmaRepository.GetAll();
  }

  static async GetPaginated(page?: number, limit?: number) {
    if (!page && !limit) {
      return await this.GetAll();
    }

    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);

    const { items, total } = await TurmaRepository.GetPaginated(page, limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return { page, limit, total, totalPages, items };
  }

  static async Update(turma: Partial<Turma>) {
    if (!turma.id) throw new BadRequestError("Id não informado");

    const updated = await TurmaRepository.UpdateById(turma.id, turma);

    if (!updated) throw new NotFoundError("Turma não encontrada para atualização.");

    return updated;
  }

  static async Delete(id: number) {
    const removed = await TurmaRepository.DeleteById(id);

    if (!removed) {
      throw new NotFoundError("Turma não encontrada para exclusão.");
    }

    return { id: id, ativo: false };
  }
}

export default TurmaService;
