import dashboardRepository from "../repositories/dashboard.repository";

class DashboardService {
  async getDashboard() {
    return await dashboardRepository.getDashboard();
  }
}

export default new DashboardService();
