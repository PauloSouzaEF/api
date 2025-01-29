import { Router } from "express";
import { verifyAuthAndAccountMiddleware } from "../middlewares/verify-auth-and-account";
import { authRouter } from "./auth-router";
import { suppliersRouter } from "./suppliers-router";
import { eventsRouter } from "./events-router";
import { dashboardRouter } from "./dashboard-router";
import { calendarRouter } from "./calendar-router";
import logEntryPointMiddleware from "../middlewares/log-entry-point";

const routes = Router();

routes.use(logEntryPointMiddleware, authRouter);

routes.use(verifyAuthAndAccountMiddleware);
routes.use(logEntryPointMiddleware);
routes.use(suppliersRouter);
routes.use(eventsRouter);
routes.use(dashboardRouter);
routes.use(calendarRouter);

export default routes;
