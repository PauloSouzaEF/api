import { HttpStatusCode } from "@/core/infra/enums/http-status-code";

import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import type { Request, Response } from "express";
import { getAvatarUrl } from "@/utils/get-avatar-url";

export class MeController {
	public static async handle(request: Request, response: Response) {
		const { id: userId } = request.user;

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const accounts = await MongooseAccountModel.find({ userId });

		const accountsPayload = accounts.map((account) => {
			return {
				id: account._id,
				name: account.name,
				plan: account.plan,
				createdAt: account.createdAt,
			};
		});

		const avatarUrl = await getAvatarUrl(userId, user.avatar);

		const userSerialized = {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			avatarUrl,
			accounts: accountsPayload,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(userSerialized);
	}
}
