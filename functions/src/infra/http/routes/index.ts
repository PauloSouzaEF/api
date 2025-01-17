import { Router } from "express";
import { verifyAuthAndAccount } from "../middlewares/verify-auth-and-account";
import { authRouter } from "./auth-router";
import { suppliersRouter } from "./suppliers-router";
import { eventsRouter } from "./events-router";
import { dashboardRouter } from "./dashboard-router";
import { calendarRouter } from "./calendar-router";

const routes = Router();

routes.use(authRouter);

routes.use(verifyAuthAndAccount);
routes.use(suppliersRouter);
routes.use(eventsRouter);
routes.use(dashboardRouter);
routes.use(calendarRouter);

export default routes;
