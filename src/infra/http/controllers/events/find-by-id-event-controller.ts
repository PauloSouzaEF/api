import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import type { Request, Response } from "express";
import { z } from "zod";

const findByIdEventParamsSchema = z.object({
	eventId: z.string().min(1),
});

export class FindByIdEventController {
	public static async handle(request: Request, response: Response) {
		const { eventId } = findByIdEventParamsSchema.parse(request.params);

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
			whatsAppNotificationDateTimes: event.whatsAppNotificationDateTimes,
			suppliers: event.suppliers.map((supplier) => ({
				name: supplier.name,
				type: supplier.type,
				value: supplier.value,
				quantity: supplier.quantity,
				isPaid: supplier?.isPaid ?? false,
			})),
			income: event.income,
			expense: event.expense,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(eventsSerialized);
	}
}
