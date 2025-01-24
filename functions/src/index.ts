// Comentado até o Google resolver o problema do pagamento
// import { onRequest } from "firebase-functions/v2/https";
// import { getApiServerConfiguration } from "./infra/http/api-server";
// import * as queues from "./infra/queues";

// const api = onRequest(getApiServerConfiguration());

// export { api, queues };

import { getApiServerConfiguration } from "./infra/http/api-server";

const server = getApiServerConfiguration();

server.listen(5000, () => console.log("🚀 Running on port 5000"));
