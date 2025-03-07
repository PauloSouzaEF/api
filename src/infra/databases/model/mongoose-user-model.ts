import { Model, Schema, model, models } from "mongoose";

export interface User {
	name: string;
	phoneNumber: string;
	email: string;
	passwordHash: string;
	avatar?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const userSchema = new Schema<User>({
	name: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true },
	passwordHash: { type: String, required: true },
	avatar: { type: String, required: false },
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

const MongoUserModel = models.User || model("User", userSchema, "users");

export default MongoUserModel as Model<User>;
