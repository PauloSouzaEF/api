export default function logInfo(message: string, ...args: unknown[]) {
	console.log(message);

	if (!!args.length) {
		console.dir(args, { depth: null });
	}
}
