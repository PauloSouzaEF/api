import { error as logError } from "node:console";

// import { getEnvVariables } from "@/env";
import mongoose from "mongoose";


export async function loadMongodbConnection() {
	try {
		// const env = getEnvVariables();s

		// await mongoose.connect(process.env.MONGODB_URL, {
		// 	minPoolSize: 2,
		// 	maxPoolSize: 10,
		// 	authSource: "admin",
		// });

		await mongoose.connect(
			"mongodb://docker:docker@localhost:27017/event-facil-mongodb",
			{
				minPoolSize: 2,
				maxPoolSize: 10,
				authSource: "admin",
			},
		);

		return mongoose;
	} catch (error) {
		logError(error);
		throw new Error("Failed to load mongodb!");
	}
}
