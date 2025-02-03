export default function logError(message: string, ...args: unknown[]) {
	console.error(message);

	if (!!args.length) {
		console.dir(args, { depth: null });
	}
}
