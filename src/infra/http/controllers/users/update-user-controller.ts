import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import type { Request, Response } from "express";
import { z } from "zod";
import * as brazilianUtils from "@brazilian-utils/brazilian-utils";

const updateUserBodySchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	phoneNumber: z.string().min(11).max(15),
});

export class UpdateUserController {
	static async handle(request: Request, response: Response) {
		const userId = request.user.id;

		const { name, email, phoneNumber } = updateUserBodySchema.parse(
			request.body,
		);

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.BadRequest).send({
				message: "User not found",
			});
		}

		const account = await MongooseAccountModel.findOne({ userId });

		if (!account) {
			return response.status(HttpStatusCode.BadRequest).send({
				message: "Account not found or user not belongs to account",
			});
		}

		const isMatchBrazilPhoneNumber = brazilianUtils.isValidPhone(phoneNumber);

		if (!isMatchBrazilPhoneNumber) {
			return response.status(HttpStatusCode.BadRequest).send({
				message: "Brazil phone number invalid",
			});
		}

		user.name = name;
		user.email = email;
		user.phoneNumber = `55${phoneNumber}`;
		user.updatedAt = new Date();

		await user.save();

		return response.status(HttpStatusCode.Ok).send();
	}
}
