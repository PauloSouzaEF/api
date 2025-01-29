import winston from "winston";

export const logError = winston.createLogger({
	level: "error",
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
}).error;
