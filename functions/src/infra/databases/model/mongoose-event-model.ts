import { Model, Schema, model, models } from "mongoose";

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
	whatsAppNotificationDateTime?: Date;
	suppliers: Supplier[];
	income: number;
	expense: number;
	jobId?: Schema.Types.ObjectId;
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
	},
	{ _id: false },
);

const eventSchema = new Schema<Event>({
	name: { type: String, required: true },
	address: { type: String, required: true },
	income: { type: Number, required: true },
	expense: { type: Number, required: true },
	shouldNotifyWhatsappWhenNear: { type: Boolean, required: true },
	whatsAppNotificationDateTime: { type: Date, required: false },
	dateTime: {
		type: Date,
		required: true,
	},
	suppliers: { type: [supplierSchema], required: true },
	accountId: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
	jobId: { type: Schema.Types.ObjectId, required: false },
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

const EventModel = models.Event || model("Event", eventSchema, "events");

export default EventModel as Model<Event>;
