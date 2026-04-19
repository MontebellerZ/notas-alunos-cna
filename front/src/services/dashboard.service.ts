import type { TDashboard } from "../types/dashboard.type";
import BaseService from "./base.service";

class DashboardService extends BaseService {
  static async getDashboard(): Promise<TDashboard> {
    return await this.get<TDashboard>("/dashboard");
  }
}

export default DashboardService;
