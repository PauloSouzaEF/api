import { Router } from "express";
import { CalendarController } from "../controllers/calendar/calendar-controller";

export const calendarRouter = Router();

calendarRouter.get("/calendar", (request, response) =>
	CalendarController.handle(request, response),
);
