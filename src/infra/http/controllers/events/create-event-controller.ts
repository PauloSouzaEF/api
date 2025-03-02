import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import { agenda } from "@/infra/libs/agenda";
import type { Request, Response } from "express";
import { z } from "zod";

const createEventBodySchema = z.object({
	name: z.string().min(1),
	dateTime: z.coerce.date(),
	address: z.string().min(1),
	shouldNotifyWhatsappWhenNear: z.boolean(),
	whatsAppNotificationDateTimes: z.array(z.coerce.date()).default([]),
	income: z.number().min(1),
	expense: z.number().min(1),
	suppliers: z.array(
		z.object({
			name: z.string().min(1),
			type: z.string().min(1),
			value: z.number().min(1),
			quantity: z.number().min(1),
			isPaid: z.boolean().default(false).optional(),
		}),
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
			whatsAppNotificationDateTimes,
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

		const doesHaveNotificationDateTimes =
			whatsAppNotificationDateTimes.length > 0;

		const eventCreated = await MongooseEventModel.create({
			name,
			dateTime: dateTime.getTime(),
			whatsAppNotificationDateTimes: doesHaveNotificationDateTimes
				? whatsAppNotificationDateTimes.map((dateTime) => dateTime.getTime())
				: [],
			address,
			shouldNotifyWhatsappWhenNear,
			income,
			expense,
			suppliers,
			accountId,
		});

		const eventId = eventCreated._id.toString();

		if (doesHaveNotificationDateTimes) {
			for (const whatsAppNotificationDateTime of whatsAppNotificationDateTimes) {
				const job = await agenda.schedule(
					whatsAppNotificationDateTime,
					"notify-whatsapp-event-job",
					{
						eventId,
						userId,
					},
				);

				const jobId = job.attrs._id;

				await MongooseEventModel.updateOne(
					{ _id: eventId },
					{ $push: { jobIds: jobId } },
				);
			}
		}

		return response.status(HttpStatusCode.Created).send();
	}
}
