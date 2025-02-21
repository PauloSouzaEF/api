import { Router } from "express";
import { CreateEventController } from "../controllers/events/create-event-controller";
import { FetchManyEventController } from "../controllers/events/fetch-many-event-controller";
import { DeleteEventController } from "../controllers/events/delete-event-controller";
import { FindByIdEventController } from "../controllers/events/find-by-id-event-controller";
import { UpdateEventController } from "../controllers/events/update-event-controller";

export const eventsRouter = Router();

eventsRouter.post("/events", (request, response) =>
	CreateEventController.handle(request, response),
);

eventsRouter.get("/events", (request, response) =>
	FetchManyEventController.handle(request, response),
);
eventsRouter.get("/events/:eventId", (request, response) =>
	FindByIdEventController.handle(request, response),
);

eventsRouter.put("/events/:eventId", (request, response) =>
	UpdateEventController.handle(request, response),
);

eventsRouter.delete("/events/:eventId", (request, response) =>
	DeleteEventController.handle(request, response),
);
