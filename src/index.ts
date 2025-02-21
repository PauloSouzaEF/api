import { getApiServerConfiguration } from "./infra/http/api-server";
import logInfo from "./infra/libs/logger/log-info";

const server = getApiServerConfiguration();

server.listen(5000, () => logInfo("🚀 Running on port 5000"));
