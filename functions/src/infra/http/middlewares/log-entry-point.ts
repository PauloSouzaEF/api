import { logInfo } from "@/infra/libs/winston";
import { NextFunction, Request, Response } from "express";

export default function logEntryPointMiddleware(
	request: Request,
	response: Response,
	nextFunction: NextFunction,
) {
	const { params, query, path, method, headers } = request;
	const host = headers["x-forwarded-host"];

	logInfo(`REQUEST | ${method} => ${path}:`, {
		params,
		query,
		path,
		host,
		user: {
			id: request.user?.id,
			accountId: request.user?.accountId,
		},
	});

	response.set("Access-Control-Allow-Origin", "*");

	return nextFunction();
}
