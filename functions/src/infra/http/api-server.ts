import { AppError } from "@/core/error/app-error";
import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import "express-async-errors";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { loadMongodbConnection } from "../libs/mongoose";
import routes from "./routes";

export function getApiServerConfiguration() {
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use(routes);

	loadMongodbConnection();

	app.use(
		(
			error: unknown,
			_request: Request,
			response: Response,
			_next: NextFunction,
		) => {
			if (error instanceof ZodError) {
				const validationErrors = fromZodError(error);

				const issues = validationErrors.details.map((detail) => {
					return {
						property: detail.path,
						message: detail.message,
					};
				});

				// logger.warn("on request error, validation error", {
				// 	issues,
				// });

				return response.status(HttpStatusCode.Conflict).send({
					message: "Validation Error",
					issues,
				});
			}

			if (error instanceof AppError) {
				const { message, payload, statusCode } = error;

				// void logger.error(message, payload);

				return response.status(statusCode).json({
					errors: {
						message,
					},
				});
			}

			console.error(error);

			return response.status(HttpStatusCode.InternalServerError).json({
				message: "Internal server error",
			});
		},
	);

	return app;
}
