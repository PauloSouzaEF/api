import { env } from "@/env";
import { Agenda } from "@hokify/agenda";

export const agenda = new Agenda({
	db: { address: env.MONGODB_URL, options: { authSource: "admin" } },
});
