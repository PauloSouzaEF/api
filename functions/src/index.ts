import { onRequest } from "firebase-functions/v2/https";
import { getApiServerConfiguration } from "./infra/http/api-server";

const api = onRequest(getApiServerConfiguration());

export { api };
