import pino from "pino";

export function logError(object: Record<string, unknown>) {
	const logger = pino();
	logger.error(object);
}
