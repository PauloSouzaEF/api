import dotenv from "dotenv";
import "@/infra/jobs";

import { AppError } from "@/core/error/app-error";
import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import express, { type Request, type Response } from "express";
import "express-async-errors";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { loadMongodbConnection } from "../libs/mongoose";
import routes from "./routes";
import { agenda } from "../libs/agenda";
import cors from "cors";
import logError from "../libs/logger/log-error";
import { wwebClient } from "../libs/wwebjs";
import { env } from "@/env";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

export function getApiServerConfiguration() {
	const app = express();

	void loadMongodbConnection();
	void wwebClient.initialize();

	void agenda.start();
	void agenda.every("0 */2 * * *", "wake-database-up-job");

	app.use(cors());

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/", (_request, response) =>
		response.status(HttpStatusCode.Ok).json({ running: true }),
	);

	if (env.NODE_ENV === "development") {
		app.use("/static", express.static("tmp"));
	}

	app.use(routes);


	app.use((error: unknown, _request: Request, response: Response) => {
		if (error instanceof ZodError) {
			const validationErrors = fromZodError(error);

			const issues = validationErrors.details.map((detail) => {
				return {
					property: detail.path,
					message: detail.message,
				};
			});

			return response.status(HttpStatusCode.Conflict).send({
				message: "Validation Error",
				issues,
			});
		}

		if (error instanceof AppError) {
			const { message, statusCode } = error;

			return response.status(statusCode).json({
				errors: {
					message,
				},
			});
		}

		logError("Internal server error", { error });

		return response.status(HttpStatusCode.InternalServerError).json({
			message: "Internal server error",
		});
	});

	return app;
}
