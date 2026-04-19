import { Router } from "express";
import dashboardService from "../services/dashboard.service";
import { getUserCtx } from "./route.utils";

const dashboardRoutes = Router();

dashboardRoutes.get("/", async (req, res) => {
  const result = await dashboardService.getDashboard(getUserCtx(req));
  res.send(result);
});

export default dashboardRoutes;
