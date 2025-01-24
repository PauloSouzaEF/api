import pino from "pino";

export function logInfo(object: Record<string, unknown>) {
	const logger = pino();
	logger.info(object);
}
