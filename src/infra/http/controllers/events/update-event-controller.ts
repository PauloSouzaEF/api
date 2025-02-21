import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import { agenda } from "@/infra/libs/agenda";
import type { Request, Response } from "express";
import { z } from "zod";

const updateEventBodySchema = z.object({
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
			isPaid: z.boolean().default(false).optional(),
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
			whatsAppNotificationDateTime,
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

		const event = await MongooseEventModel.findById(eventId);

		if (!event) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		await MongooseEventModel.updateOne(
			{
				_id: eventId,
			},
			{
				$set: {
					name,
					dateTime: dateTime.getTime(),
					address,
					shouldNotifyWhatsappWhenNear,
					whatsAppNotificationDateTime: whatsAppNotificationDateTime?.getTime(),
					income,
					expense,
					suppliers,
					accountId,
				},
			},
		);

		if (whatsAppNotificationDateTime && event.jobId) {
			await agenda.cancel({
				_id: event.jobId,
			});

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
				{
					_id: eventId,
				},
				{
					$set: {
						jobId,
					},
				},
			);
		}

		return response.status(HttpStatusCode.Ok).send();
	}
}
