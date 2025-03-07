import { env } from "@/env";
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client as AwsS3Client,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadFile } from "./interfaces";

export class S3Client {
	private static s3Client = new AwsS3Client({
		region: env.AWS_REGION,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		},
	});

	static async uploadFile({ key, buffer }: UploadFile) {
		const command = new PutObjectCommand({
			Bucket: env.AWS_BUCKET_NAME,
			Key: key,
			Body: buffer,
		});

		return this.s3Client.send(command);
	}

	static async deleteFile(key: string) {
		const command = new DeleteObjectCommand({
			Bucket: env.AWS_BUCKET_NAME,
			Key: key,
		});

		return this.s3Client.send(command);
	}

	static async getFileUrl(key: string) {
		const command = new GetObjectCommand({
			Bucket: env.AWS_BUCKET_NAME,
			Key: key,
		});

		const oneDay = 60 * 60 * 24;
		return getSignedUrl(this.s3Client, command, { expiresIn: oneDay });
	}
}
