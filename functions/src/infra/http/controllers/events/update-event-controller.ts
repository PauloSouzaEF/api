import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseAccountModel } from "@/infra/databases/model/mongoose-account-model";
import { MongooseEventModel } from "@/infra/databases/model/mongoose-event-model";
import { MongooseUserModel } from "@/infra/databases/model/mongoose-user-model";
import type { Request, Response } from "express";
import { z } from "zod";

const updateEventBodySchema = z.object({
	name: z.string().min(1),
	dateTime: z.coerce.date(),
	address: z.string().min(1),
	shouldNotifyWhatsappWhenNear: z.boolean(),
	whatsappNotificationDateTime: z.date().optional(),
	income: z.number().min(1),
	expense: z.number().min(1),
	suppliers: z.array(
		z.object({
			name: z.string().min(1),
			type: z.string().min(1),
			value: z.number().min(1),
			quantity: z.number().min(1),
		}),
	),
});

export class UpdateEventController {
	public static async handle(request: Request, response: Response) {
		const { id: userId, accountId } = request.user;
		const { eventId } = request.params;
		const {
			name,
			dateTime,
			address,
			shouldNotifyWhatsappWhenNear,
			whatsappNotificationDateTime,
			income,
			expense,
			suppliers,
		} = updateEventBodySchema.parse(request.body);

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const accountAlreadyExists = await MongooseAccountModel.findById(accountId);

		if (!accountAlreadyExists) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		await MongooseEventModel.updateOne(
			{
				_id: eventId,
			},
			{
				$set: {
					name,
					dateTime,
					address,
					shouldNotifyWhatsappWhenNear,
					whatsappNotificationDateTime,
					income,
					expense,
					suppliers,
					accountId,
				},
			},
		);

		return response.status(HttpStatusCode.Ok).send();
	}
}
