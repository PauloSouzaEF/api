import { Router } from "express";
import { DashboardController } from "../controllers/dashboard/dashboard-controller";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard", (request, response) =>
	DashboardController.handle(request, response),
);
