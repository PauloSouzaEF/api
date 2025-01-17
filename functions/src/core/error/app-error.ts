import type { HttpStatusCode } from "../infra/enums/http-status-code";

export interface AppErrorProps {
	message: string;
	payload?: Record<string, unknown>;
	statusCode: HttpStatusCode;
}

export class AppError extends Error implements AppErrorProps {
	public readonly message: string;
	public readonly payload: Record<string, unknown>;
	public readonly statusCode: HttpStatusCode;

	constructor({ message, statusCode, payload = {} }: AppErrorProps) {
		super();

		this.message = message;
		this.payload = payload;
		this.statusCode = statusCode;
	}
}
