import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import MongooseSupplierModel from "@/infra/databases/model/mongoose-supplier-model";
import type { Request, Response } from "express";
import { z } from "zod";

const deleteSupplierParamsSchema = z.object({
	supplierId: z.string().min(1),
});

export class DeleteSupplierController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { supplierId } = deleteSupplierParamsSchema.parse(request.params);

		await MongooseSupplierModel.deleteOne({ _id: supplierId, accountId });

		return response.status(HttpStatusCode.NoContent).send();
	}
}
