import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseAccountModel, {
	Plan,
} from "@/infra/databases/model/mongoose-account-model";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";

const registerUserBodySchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	phoneNumber: z.string().min(11).max(15),
});

export class RegisterUserController {
	public static async handle(request: Request, response: Response) {
		const { email, password, phoneNumber, name } = registerUserBodySchema.parse(
			request.body,
		);

		const userAlreadyCreated = await MongooseUserModel.findOne({ email });

		if (userAlreadyCreated) {
			return response
				.status(HttpStatusCode.BadRequest)
				.json({ message: "User already created" });
		}

		const hashedPassword = bcrypt.hashSync(password, 10);

		const userCreated = await MongooseUserModel.create({
			name,
			phoneNumber,
			email,
			passwordHash: hashedPassword,
		});

		await MongooseAccountModel.create({
			name,
			plan: Plan.ESSENTIAL,
			userId: userCreated._id,
		});

		return response.status(HttpStatusCode.Created).send();
	}
}
