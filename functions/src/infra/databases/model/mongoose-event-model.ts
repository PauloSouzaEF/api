import { Schema, model } from "mongoose";

export interface Supplier {
	name: string;
	type: string;
	value: number;
	quantity: number;
}

export interface Event {
	name: string;
	dateTime: Date;
	address: string;
	shouldNotifyWhatsappWhenNear: boolean;
	suppliers: Supplier[];
	income: number;
	expense: number;
	accountId: Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const supplierSchema = new Schema<Supplier>(
	{
		name: { type: String, required: true },
		type: { type: String, required: true },
		value: { type: Number, required: true },
		quantity: { type: Number, required: true },
	},
	{ _id: false },
);

const eventSchema = new Schema<Event>({
	name: { type: String, required: true },
	address: { type: String, required: true },
	income: { type: Number, required: true },
	expense: { type: Number, required: true },
	shouldNotifyWhatsappWhenNear: { type: Boolean, required: true },
	dateTime: {
		type: Date,
		required: true,
	},
	suppliers: { type: [supplierSchema], required: true },
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

export const MongooseEventModel = model("Event", eventSchema, "events");
