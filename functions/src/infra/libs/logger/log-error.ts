export default function logError(message: string, ...args: unknown[]) {
	console.error(message);
	console.dir(args, { depth: null });
}
