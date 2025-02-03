import { error as logError } from "node:console";

import mongoose from "mongoose";
import { env } from "@/env";
import { logInfo } from "../logger";

const MAX_RETRIES = 5;

export async function loadMongodbConnection(attempt = 1) {
	try {
		await mongoose.connect(env.MONGODB_URL, {
			minPoolSize: 2,
			maxPoolSize: 10,
			authSource: "admin",
			serverSelectionTimeoutMS: 5000,
		});

		return mongoose;
	} catch (error) {
		logError(error);

		if (attempt < MAX_RETRIES) {
			const delay = Math.pow(2, attempt) * 1000; // Atraso exponencial
			logInfo(
				`⚠️ Falha ao conectar, tentando novamente em ${delay / 1000}s...`,
			);
			setTimeout(() => loadMongodbConnection(attempt + 1), delay);
		} else {
			throw new Error("Failed to load mongodb!");
		}
	}
}
