export default function logInfo(message: string, ...args: unknown[]) {
	console.log(message);
	console.dir(args, { depth: null });
}
