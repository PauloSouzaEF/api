import { HttpStatusCode } from "@/core/infra/enums/http-status-code";
import { env } from "@/env";
import MongoUserModel from "@/infra/databases/model/mongoose-user-model";
import type {  Request, Response } from "express";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";

export class UploadUserAvatarController {
	static async handle(request: Request, response: Response) {
		const file = request.file as Express.Multer.File;
		const userId = request.user.id;

		if (!file) {
			return response.status(HttpStatusCode.BadRequest).json({
				message: "File not found."
			})
		}

		if (!file.mimetype.startsWith('image/')) {
			return response.status(HttpStatusCode.BadRequest).json({
				message: 'Only image files are allowed (PNG, JPG, etc.)'
			});
		}

		const maxFileSize = 5 * 1024 * 1024;
		if (file.size > maxFileSize) {
			return response.status(HttpStatusCode.BadRequest).json({
				message: `Image size must be equal or below of 5mb`
			});
		}

		const avatar = this.generateAvatarUniqueId(file.originalname);

		try {
			await this.deleteOldAvatar(userId);
		} catch (error) {
			return response.status(HttpStatusCode.InternalServerError).json({
				message: "Failed to delete old avatar."
			});
		}


		try {			
			await this.uploadAvatar(userId, avatar, file);

			await MongoUserModel.findByIdAndUpdate(userId, {
				avatar
			});
		} catch (err) {
			console.error(err);
			return response.status(HttpStatusCode.InternalServerError).json({
				message: "Failed to save and upload avatar"
			});
		}

		return response.status(HttpStatusCode.Ok).send();
	}

	private static async deleteOldAvatar(userId: string) {
		const user = await MongoUserModel.findById(userId);

		if (!user?.avatar) {
			return;
		}

		const isDevelopmentEnv = env.NODE_ENV === "development";

		if (isDevelopmentEnv) {
			unlinkSync(`tmp/${userId}/${user.avatar}`);

			return;
		}
	}

	private static async uploadAvatar(userId: string, avatar: string, file: Express.Multer.File) {
		const isDevelopmentEnv = env.NODE_ENV === "development";

		if (isDevelopmentEnv) {
			mkdirSync(`tmp/${userId}`, { recursive: true });

			const filePath = `tmp/${userId}/${avatar}`;
			writeFileSync(filePath, file.buffer);
		}

		// TODO: Implementar usando a lib da AWS
	}

	private static generateAvatarUniqueId(fileName: string) {
		return `${Date.now()}_${fileName}`;
	}
}