import dashboardRepository from "../repositories/dashboard.repository";
import type { UserCtx } from "../middleware/auth.middleware";

class DashboardService {
  async getDashboard(ctx?: UserCtx) {
    return await dashboardRepository.getDashboard(ctx);
  }
}

export default new DashboardService();
