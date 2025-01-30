import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import type { Request, Response } from "express";
import { z } from "zod";

const calendarQuerySchema = z.object({
	fromDate: z.coerce.date(),
	toDate: z.coerce.date(),
});

export class CalendarController {
	public static async handle(request: Request, response: Response) {
		console.log(
			"[CalendarController] Handling request to list events for user",
			request.query,
		);

		const { accountId } = request.user;
		const { fromDate, toDate } = calendarQuerySchema.parse(request.query);

		const events = await MongooseEventModel.find({
			accountId,
			dateTime: {
				$gte: fromDate,
				$lte: toDate,
			},
		});

		const eventsSerialized = events.map((event) => ({
			id: event._id,
			name: event.name,
			dateTime: event.dateTime,
			address: event.address,
			shouldNotifyWhatsappWhenNear: event.shouldNotifyWhatsappWhenNear,
			income: event.income,
			expense: event.expense,
			suppliers: event.suppliers,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
		}));

		return response.status(HttpStatusCode.Ok).json(eventsSerialized);
	}
}
