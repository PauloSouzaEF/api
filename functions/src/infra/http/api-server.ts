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
import pinoHttp from "pino-http";
import { agenda } from "../libs/agenda";
import cors from "cors";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

export function getApiServerConfiguration() {
	const app = express();

	app.use(cors());
	app.use(pinoHttp());

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	void loadMongodbConnection();
	void agenda.start();

	app.use(routes);

	app.get("/", (_, response) => {
		return response.status(HttpStatusCode.Ok).send({ ok: true });
	});

	app.use((error: unknown, request: Request, response: Response) => {
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

		request.log.error("Internal server error", error);

		return response.status(HttpStatusCode.InternalServerError).json({
			message: "Internal server error",
		});
	});

	return app;
}
