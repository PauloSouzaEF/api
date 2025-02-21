import { Router } from "express";
import { ReportsController } from "../controllers/reports/reports-controller";

export const reportsRouter = Router();

reportsRouter.get("/reports", (request, response) =>
	ReportsController.handle(request, response),
);
