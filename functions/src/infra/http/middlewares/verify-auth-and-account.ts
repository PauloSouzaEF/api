import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { getEnvVariables } from "@/env";
import type { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

interface TokenPayload {
	sub: string;
}

export function verifyAuthAndAccount(
	request: Request,
	response: Response,
	next: NextFunction,
) {
	const env = getEnvVariables();
	const authHeader = request.headers.authorization;
	const accountId = request.headers["x-account-id"];

	if (!authHeader) {
		return response.status(HttpStatusCode.Unauthorized).send();
	}

	if (!accountId) {
		return response.status(HttpStatusCode.Unauthorized).send();
	}

	const [, token] = authHeader.split(" ");

	try {
		const decoded = jsonwebtoken.verify(token, env.JWT_SECRET);

		const { sub } = decoded as TokenPayload;

		request.user = {
			id: sub,
			accountId: accountId as string,
		};

		return next();
	} catch {
		return response.status(HttpStatusCode.Unauthorized).json();
	}
}
