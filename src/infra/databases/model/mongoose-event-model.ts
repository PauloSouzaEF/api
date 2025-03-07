import { Model, Schema, model, models } from "mongoose";

export interface Supplier {
	name: string;
	type: string;
	value: number;
	quantity: number;
	isPaid: boolean;
}

export interface Event {
	name: string;
	dateTime: Date;
	address: string;
	shouldNotifyWhatsappWhenNear: boolean;
	whatsAppNotificationDateTimes?: Date[];
	suppliers: Supplier[];
	income: number;
	expense: number;
	jobIds?: Schema.Types.ObjectId[];
	jobExecution?: Date;
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
		isPaid: { type: Boolean, required: true, default: false },
	},
	{ _id: false },
);

const eventSchema = new Schema<Event>({
	name: { type: String, required: true },
	address: { type: String, required: true },
	income: { type: Number, required: true },
	expense: { type: Number, required: true },
	shouldNotifyWhatsappWhenNear: { type: Boolean, required: true },
	whatsAppNotificationDateTimes: { type: [Date], required: false },
	dateTime: {
		type: Date,
		required: true,
	},
	suppliers: { type: [supplierSchema], required: true },
	accountId: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
	jobIds: { type: [Schema.Types.ObjectId], required: false },
	jobExecution: { type: Date, required: false },
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

const MongoEventModel = models.Event || model("Event", eventSchema, "events");

export default MongoEventModel as Model<Event>;
