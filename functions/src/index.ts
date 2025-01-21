import { onRequest } from "firebase-functions/v2/https";
import { getApiServerConfiguration } from "./infra/http/api-server";
import * as queues from "./infra/queues";

const api = onRequest(getApiServerConfiguration());

export { api, queues };
