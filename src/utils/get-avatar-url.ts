import { S3Client } from "@/infra/libs/aws/s3";
import { env } from "@/env";

export async function getAvatarUrl(userId: string, avatar?: string) {
	if (!avatar) {
		return "";
	}

	if (env.NODE_ENV === "development") {
		const baseUrl = "http://localhost:5000";
		return `${baseUrl}/static/${userId}/${avatar}`;
	}

	const s3FileUrl = await S3Client.getFileUrl(avatar);

	return s3FileUrl;
}
