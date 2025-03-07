import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	MONGODB_URL: z.string().default(""),
	JWT_SECRET: z.string().default(""),
});

export const env = envSchema.parse(process.env);
