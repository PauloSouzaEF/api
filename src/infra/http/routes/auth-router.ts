import { Router } from "express";
import { LoginUserController } from "../controllers/auth/login-user-controller";
import { RegisterUserController } from "../controllers/auth/register-user-controller";
import { MeController } from "../controllers/auth/me-controller";
import { verifyAuthAndAccountMiddleware } from "../middlewares/verify-auth-and-account";
import { UploadUserAvatarController } from "../controllers/auth/upload-user-avatar-controller";
import { upload } from "@/infra/libs/multer";
import { UpdateUserController } from "../controllers/auth/update-user-controller";

export const authRouter = Router();

authRouter.post("/register", (request, response) =>
	RegisterUserController.handle(request, response),
);

authRouter.post("/login", (request, response) =>
	LoginUserController.handle(request, response),
);

authRouter.get("/me", verifyAuthAndAccountMiddleware, (request, response) =>
	MeController.handle(request, response),
);

authRouter.patch(
	"/me/avatar",
	upload.single("avatar"),
	verifyAuthAndAccountMiddleware,
	(request, response) => UploadUserAvatarController.handle(request, response),
);

authRouter.put("/me", verifyAuthAndAccountMiddleware, (request, response) =>
	UpdateUserController.handle(request, response),
);
