import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { z } from "zod";

const envSchema = z.object({
	MONGODB_URL: z.string().default(""),
	JWT_SECRET: z.string().default(""),
	FUNCTIONS_EMULATOR: z.string().default(""),
	WHATSAPP_ACCESS_TOKEN: z.string().default(""),
	WHATSAPP_PHONE_NUMBER_ID: z.string().default(""),
});

export const env = envSchema.parse(process.env);
