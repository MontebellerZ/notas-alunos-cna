import BaseRepository from "../repositories/base.repository";
import { BadRequestError, NotFoundError } from "../errors/errors";
import Consts from "../../config/consts";

class BaseService {
  protected repo: BaseRepository;
  protected entityName: string;

  constructor(repo: BaseRepository, entityName: string) {
    this.repo = repo;
    this.entityName = entityName;
  }

  async getAll() {
    return await this.repo.getAll();
  }

  async getPaginated(page?: number, limit?: number) {
    if (!page && !limit) {
      return await this.getAll();
    }

    page = Math.max(1, page ?? 1);
    limit = Math.max(1, limit ?? Consts.pageSize);

    const { items, total } = await this.repo.getPaginated(page, limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return { page, limit, total, totalPages, items };
  }

  async getById(id: number) {
    const item = await this.repo.getById(id);
    if (!item) throw new NotFoundError(`${this.entityName} não encontrado.`);
    return item;
  }

  async create(data: any) {
    return await this.repo.create(data);
  }

  async update(data: any) {
    if (!data.id) throw new BadRequestError("Id não informado");

    const updated = await this.repo.updateById(data.id, data);
    if (!updated) throw new NotFoundError(`${this.entityName} não encontrado para atualização.`);

    return updated;
  }

  async delete(id: number) {
    const removed = await this.repo.deleteById(id);
    if (!removed) throw new NotFoundError(`${this.entityName} não encontrado para exclusão.`);

    return { id, ativo: false };
  }
}

export default BaseService;
