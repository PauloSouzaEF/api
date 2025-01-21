import { onTaskDispatched } from "firebase-functions/tasks";

interface RequestData {
	eventId: string;
}

export default onTaskDispatched<RequestData>(
	{
		retryConfig: {
			maxAttempts: 3,
			minBackoffSeconds: 60,
		},
		rateLimits: {
			maxConcurrentDispatches: 6,
		},
	},
	async (request) => {
		const { eventId } = request.data;

		console.log({ eventId });
	}
);
