import { models } from "mongoose";
import { Schema, model } from "mongoose";

export interface Costs {
	type: string;
	value: number;
}

export interface Supplier {
	name: string;
	costs: Costs[];
	accountId: Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const costSchema = new Schema<Costs>(
	{
		type: { type: String, required: true },
		value: { type: Number, required: true },
	},
	{ _id: false },
);

const supplierSchema = new Schema<Supplier>({
	name: { type: String, required: true },
	costs: [costSchema],
	accountId: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	deletedAt: {
		type: Date,
	},
});

export const MongooseSupplierModel =
	models.Supplier || model("Supplier", supplierSchema, "suppliers");
