import { env } from "@/env";

export default function isEmulator() {
	return (
		(typeof env.FUNCTIONS_EMULATOR === "boolean" && env.FUNCTIONS_EMULATOR) ||
		env.FUNCTIONS_EMULATOR === "true"
	);
}
