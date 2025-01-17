import { Schema, model } from "mongoose";

export enum Plan {
	ESSENTIAL = "essential",
	CLASSIC = "classic",
	PREMIUM = "premium",
	EXCLUSIVE = "exclusive",
}

export interface Account {
	name: string;
	plan: Plan;
	userId: Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const accountSchema = new Schema<Account>({
	name: { type: String, required: true },
	plan: { type: String, enum: Object.values(Plan), required: true },
	userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
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

export const MongooseAccountModel = model("Account", accountSchema, "accounts");
