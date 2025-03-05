
import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import type { Request, Response } from "express";

export class MeController {
	public static async handle(request: Request, response: Response) {
		const { id: userId } = request.user;

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const userSerialized = {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(userSerialized);
	}
}