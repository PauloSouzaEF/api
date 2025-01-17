import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { MongooseSupplierModel } from "@/infra/databases/model/mongoose-supplier-model";
import type { Request, Response } from "express";
import { z } from "zod";

const fetchManySupplierQuerySchema = z.object({
	query: z.string().optional(),
	limit: z
		.coerce
		.number({ message: 'Limit must be a number' })
		.default(30),
	page: z
		.coerce
		.number({ message: 'Page must be a number' })
		.default(1),
});

export class FetchManySupplierController {
	public static async handle(request: Request, response: Response) {
		const { accountId } = request.user;
		const { limit, page, query } = fetchManySupplierQuerySchema.parse(
			request.query,
		);

		const suppliers = await MongooseSupplierModel.find({
			accountId,
			...(query && {
				$or: [{ name: { $regex: query, $options: "i" } }],
			}),
		})
			.limit(limit)
			.skip((page - 1) * limit);

		const suppliersCount = await MongooseSupplierModel.countDocuments({
			accountId,
		});

		const suppliersSerialized = suppliers.map((supplier) => ({
			id: supplier._id,
			name: supplier.name,
			costs: supplier.costs.map((cost) => ({
				type: cost.type,
				value: cost.value,
			})),
			createdAt: supplier.createdAt,
			updatedAt: supplier.updatedAt,
		}));

		const totalPages = Math.ceil(suppliersCount / limit);

		return response.status(HttpStatusCode.Ok).json({
			data: suppliersSerialized,
			meta: {
				page,
				limit,
				total: suppliersCount,
				totalPages,
			},
		});
	}
}
