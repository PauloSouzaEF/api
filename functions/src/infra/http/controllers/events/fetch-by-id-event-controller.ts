import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseEventModel } from "@/infra/databases/model/mongoose-event-model";
import type { Request, Response } from "express";
import { z } from "zod";

const fetchbyidEventParamsSchema = z.object({
	eventId: z.string().min(1),
});

export class FetchByIdEventController {
	public static async handle(request: Request, response: Response) {
		const { eventId } = fetchbyidEventParamsSchema.parse(request.params);

		const event = await MongooseEventModel.findById(eventId);

		if (!event) {
			return response.status(HttpStatusCode.BadRequest).send();
		}

		const eventsSerialized = {
			id: event._id,
			name: event.name,
			dateTime: event.dateTime,
			address: event.address,
			shouldNotifyWhatsappWhenNear: event.shouldNotifyWhatsappWhenNear,
			whatsAppNotificationDateTime: event.whatsAppNotificationDateTime,
			suppliers: event.suppliers.map((supplier) => ({
				name: supplier.name,
				type: supplier.type,
				value: supplier.value,
				quantity: supplier.quantity,
			})),
			income: event.income,
			expense: event.expense,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(eventsSerialized);
	}
}
