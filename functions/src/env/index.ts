import { z } from "zod";

const envSchema = z.object({
	MONGODB_URL: z.string().default(""),
	JWT_SECRET: z.string().default(""),
	FUNCTIONS_EMULATOR: z.string().default(""),
});

export function getEnvVariables() {
	return envSchema.parse(process.env);
}
