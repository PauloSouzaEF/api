import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseAccountModel } from "@/infra/databases/model/mongoose-account-model";
import { MongooseEventModel } from "@/infra/databases/model/mongoose-event-model";
import { MongooseUserModel } from "@/infra/databases/model/mongoose-user-model";
import type { Request, Response } from "express";
import { z } from "zod";

const createEventBodySchema = z.object({
	name: z.string().min(1),
	dateTime: z.coerce.date(),
	address: z.string().min(1),
	shouldNotifyWhatsappWhenNear: z.boolean(),
	whatsAppNotificationDateTime: z.coerce.date().optional(),
	income: z.number().min(1),
	expense: z.number().min(1),
	suppliers: z.array(
		z.object({
			name: z.string().min(1),
			type: z.string().min(1),
			value: z.number().min(1),
			quantity: z.number().min(1),
		})
	),
});

export class CreateEventController {
	public static async handle(request: Request, response: Response) {
		const { id: userId, accountId } = request.user;
		const {
			name,
			dateTime,
			address,
			shouldNotifyWhatsappWhenNear,
			whatsAppNotificationDateTime,
			income,
			expense,
			suppliers,
		} = createEventBodySchema.parse(request.body);

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const accountAlreadyExists = await MongooseAccountModel.findById(accountId);

		if (!accountAlreadyExists) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		await MongooseEventModel.create({
			name,
			dateTime: dateTime.getTime(),
			whatsAppNotificationDateTime: whatsAppNotificationDateTime && new Date(whatsAppNotificationDateTime).getTime(),
			address,
			shouldNotifyWhatsappWhenNear,
			income,
			expense,
			suppliers,
			accountId,
		});

		return response.status(HttpStatusCode.Created).send();
	}
}
