import { Router } from "express";
import dashboardService from "../services/dashboard.service";

const dashboardRoutes = Router();

dashboardRoutes.get("/", async (_req, res) => {
  const result = await dashboardService.getDashboard();
  res.send(result);
});

export default dashboardRoutes;
