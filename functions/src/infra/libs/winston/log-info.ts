import winston from "winston";

export const logInfo = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
}).info;
