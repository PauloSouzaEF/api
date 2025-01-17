import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseEventModel } from "@/infra/databases/model/mongoose-event-model";
import type { Request, Response } from "express";
import { z } from "zod";

const deleteEventParamsSchema = z.object({
	eventId: z.string().min(1),
});

export class DeleteEventController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { eventId } = deleteEventParamsSchema.parse(request.params);

		await MongooseEventModel.deleteOne({ _id: eventId, accountId });

		return response.status(HttpStatusCode.NoContent).send();
	}
}
