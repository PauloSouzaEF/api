import { getEnvVariables } from "@/env";

export default function isEmulator() {
	const env = getEnvVariables();

	return (
		(typeof env.FUNCTIONS_EMULATOR === "boolean" && env.FUNCTIONS_EMULATOR) ||
		env.FUNCTIONS_EMULATOR === "true"
	);
}
