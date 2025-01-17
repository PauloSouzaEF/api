import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseSupplierModel } from "@/infra/databases/model/mongoose-supplier-model";
import type { Request, Response } from "express";
import { z } from "zod";

const updateSupplierParamsSchema = z.object({
	name: z.string(),
	costs: z.array(
		z.object({
			type: z.string(),
			value: z.number(),
		}),
	),
});

export class UpdateSupplierController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { supplierId } = request.params;
		const { costs, name } = updateSupplierParamsSchema.parse(request.body);

		const supplier = await MongooseSupplierModel.findOne({
			_id: supplierId,
			accountId,
		});

		if (!supplier) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		await MongooseSupplierModel.updateOne(
			{ _id: supplierId },
			{
				$set: {
					name,
					costs,
				},
			},
		);

		return response.status(HttpStatusCode.NoContent).send();
	}
}
