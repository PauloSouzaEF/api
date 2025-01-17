import { Schema, model } from "mongoose";

export interface User {
	name: string;
	phoneNumber: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const userSchema = new Schema<User>({
	name: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true },
	passwordHash: { type: String, required: true },
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

export const MongooseUserModel = model("User", userSchema, "users");
