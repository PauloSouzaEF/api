import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseEventModel from "@/infra/databases/model/mongoose-event-model";
import { agenda } from "@/infra/libs/agenda";
import type { Request, Response } from "express";
import { z } from "zod";

const deleteEventParamsSchema = z.object({
	eventId: z.string().min(1),
});

export class DeleteEventController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { eventId } = deleteEventParamsSchema.parse(request.params);

		const event = await MongooseEventModel.findOne({
			_id: eventId,
			accountId,
		});

		if (!event) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		if (event.jobIds?.length) {
			for (const jobId of event.jobIds) {
				await agenda.cancel({ _id: jobId });
			}
		}

		await MongooseEventModel.deleteOne({ _id: eventId, accountId });

		return response.status(HttpStatusCode.NoContent).send();
	}
}
