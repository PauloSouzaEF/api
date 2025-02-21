import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import type { Request, Response } from "express";
import { z } from "zod";

const fetchManyEventQuerySchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number({ message: "Limit must be a number" }).default(30),
	page: z.coerce.number({ message: "Page must be a number" }).default(1),
});

export class FetchManyEventController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { limit, page, query } = fetchManyEventQuerySchema.parse(
			request.query,
		);

		const events = await MongooseEventModel.find({
			accountId,
			...(query && {
				$or: [{ name: { $regex: query, $options: "i" } }],
			}),
		})
			.limit(limit)
			.skip((page - 1) * limit);

		const eventsCount = await MongooseEventModel.countDocuments({
			accountId,
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

		const totalPages = Math.ceil(eventsCount / limit);

		return response.status(HttpStatusCode.Ok).json({
			data: eventsSerialized,
			meta: {
				page,
				limit,
				total: eventsCount,
				totalPages,
			},
		});
	}
}
