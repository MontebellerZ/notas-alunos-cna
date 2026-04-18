import Consts from "../../config/consts";

interface PrismaDelegate {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
}

class BaseRepository {
  protected delegate: PrismaDelegate;

  constructor(delegate: PrismaDelegate) {
    this.delegate = delegate;
  }

  async getAll() {
    return await this.delegate.findMany({
      where: { ativo: true },
      orderBy: { id: "desc" },
    });
  }

  async getPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { ativo: true };

    const [items, total] = await Promise.all([
      this.delegate.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
      this.delegate.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number) {
    return await this.delegate.findUnique({ where: { id } });
  }

  async create(data: any) {
    return await this.delegate.create({ data });
  }

  async updateById(id: number, data: any) {
    try {
      return await this.delegate.update({ where: { id }, data });
    } catch (e: any) {
      if (e?.code === "P2025") return null;
      throw e;
    }
  }

  async deleteById(id: number) {
    try {
      await this.delegate.update({ where: { id }, data: { ativo: false } });
      return true;
    } catch (e: any) {
      if (e?.code === "P2025") return false;
      throw e;
    }
  }
}

export default BaseRepository;
