import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { logInfo } from "../logger";

export const wwebClient = new Client({
	puppeteer: {
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	},
	authStrategy: new LocalAuth({
		dataPath: ".wwjs",
	}),
});

wwebClient.once("ready", () => {
	logInfo("Client is ready!");
});

wwebClient.on("qr", (qr) => {
	qrcode.generate(qr, { small: true });
});
