import mongoose from "mongoose";
import { agenda } from "../libs/agenda";
import { logError, logInfo } from "../libs/logger";

agenda.define("wake-database-up-job", async () => {
	try {
		await mongoose.connection?.db?.admin()?.command({ ping: 1 });
		logInfo("on wake-database-up-job, database is up");
	} catch (error) {
		logError("on wake-database-up-job, wake database up error", {
			error,
		});
	}
});
