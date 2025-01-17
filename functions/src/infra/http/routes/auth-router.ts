import { Router } from "express";
import { LoginUserController } from "../controllers/auth/login-user-controller";
import { RegisterUserController } from "../controllers/auth/register-user-controller";

export const authRouter = Router();

authRouter.post("/register", (request, response) =>
	RegisterUserController.handle(request, response),
);

authRouter.post("/login", (request, response) =>
	LoginUserController.handle(request, response),
);
