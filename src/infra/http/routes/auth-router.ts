import { Router } from "express";
import { LoginUserController } from "../controllers/auth/login-user-controller";
import { RegisterUserController } from "../controllers/auth/register-user-controller";
import { MeController } from "../controllers/auth/me-controller";
import { verifyAuthAndAccountMiddleware } from "../middlewares/verify-auth-and-account";

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

