import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { env } from "@/env";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import { getAvatarUrl } from "@/utils/get-avatar-url";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { z } from "zod";

const loginUserBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	rememberMe: z.boolean().optional().default(false),
});

export class LoginUserController {
	public static async handle(request: Request, response: Response) {
		const { email, password, rememberMe } = loginUserBodySchema.parse(
			request.body,
		);

		const user = await MongooseUserModel.findOne({ email });

		if (!user) {
			return response.status(HttpStatusCode.BadRequest).send({
				message: "Invalid email or password!",
			});
		}

		const passwordMatch = bcrypt.compareSync(password, user.passwordHash);

		if (!passwordMatch) {
			return response
				.status(HttpStatusCode.BadRequest)
				.send({ message: "Invalid email or password!" });
		}

		const userId = user._id.toString();
		const expiresIn = rememberMe ? "7d" : "1d";

		const token = jsonwebtoken.sign({ sub: userId }, env.JWT_SECRET, {
			expiresIn,
		});

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

		return response.status(HttpStatusCode.Ok).send({
			id: userId,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			avatarUrl,
			token,
			createdAt: user.createdAt,
			accounts: accountsPayload,
		});
	}
}
