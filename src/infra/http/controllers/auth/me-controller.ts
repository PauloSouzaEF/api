import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { env } from "@/env";
import MongooseUserModel from "@/infra/databases/model/mongoose-user-model";
import { S3Client } from "@/infra/libs/aws/s3";
import type { Request, Response } from "express";

export class MeController {
	public static async handle(request: Request, response: Response) {
		const { id: userId } = request.user;

		const user = await MongooseUserModel.findById(userId);

		if (!user) {
			return response.status(HttpStatusCode.NotFound).send();
		}

		const avatarUrl = await this.getAvatarUrl(userId, user.avatar);

		const userSerialized = {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			avatarUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return response.status(HttpStatusCode.Ok).send(userSerialized);
	}

	private static async getAvatarUrl(userId: string, avatar?: string) {
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
}
