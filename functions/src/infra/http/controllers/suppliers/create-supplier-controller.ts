import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseAccountModel from "@/infra/databases/model/mongoose-account-model";
import MongooseSupplierModel from "@/infra/databases/model/mongoose-supplier-model";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import type { Request, Response } from "express";
import { z } from "zod";

const createSupplierBodySchema = z.object({
	name: z.string().min(1),
	costs: z.array(
		z.object({
			type: z.string().min(1),
			value: z.number().min(0),
		}),
	),
});

export class CreateSupplierController {
	public static async handle(request: Request, response: Response) {
		const { id: userId, accountId } = request.user;
		const { costs, name } = createSupplierBodySchema.parse(request.body);

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const accountAlreadyExists = await MongooseAccountModel.findById(accountId);

		if (!accountAlreadyExists) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		await MongooseSupplierModel.create({
			accountId,
			name,
			costs,
		});

		return response.status(HttpStatusCode.Created).send();
	}
}
