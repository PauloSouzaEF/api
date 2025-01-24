import { error as logError } from "node:console";

import mongoose from "mongoose";
import { env } from "@/env";

export async function loadMongodbConnection() {
	try {
		await mongoose.connect(env.MONGODB_URL, {
			minPoolSize: 2,
			maxPoolSize: 10,
			authSource: "admin",
		});

		return mongoose;
	} catch (error) {
		logError(error);
		throw new Error("Failed to load mongodb!");
	}
}
