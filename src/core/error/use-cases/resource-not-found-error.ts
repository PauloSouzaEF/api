import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { AppError } from "../app-error";

export class ResourceNotFoundError extends AppError {
	constructor(message?: string) {
		super({
			message: message ?? "Resource not found",
			statusCode: HttpStatusCode.NotFound,
		});
	}
}
