import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseSupplierModel } from "@/infra/databases/model/mongoose-supplier-model";
import type { Request, Response } from "express";
import { z } from "zod";

const fetchbyidSupplierParamsSchema = z.object({
	supplierId: z.string().min(1),
});

export class FetchByIdSupplierController {
	public static async handle(request: Request, response: Response) {
		const { supplierId } = fetchbyidSupplierParamsSchema.parse(request.params);

		const supplier = await MongooseSupplierModel.findById(supplierId);

		if (!supplier) {
			return response.status(HttpStatusCode.BadRequest).send();
		}

		const suppliersSerialized = {
			id: supplier._id,
			name: supplier.name,
			costs: supplier.costs.map((cost) => ({
				type: cost.type,
				value: cost.value,
			})),
			createdAt: supplier.createdAt,
			updatedAt: supplier.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(suppliersSerialized);
	}
}
