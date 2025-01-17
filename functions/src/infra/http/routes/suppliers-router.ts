import { Router } from "express";
import { CreateSupplierController } from "../controllers/suppliers/create-supplier-controller";
import { DeleteSupplierController } from "../controllers/suppliers/delete-supplier-controller";
import { FetchByIdSupplierController } from "../controllers/suppliers/fetch-by-id-supplier-controller";
import { FetchManySupplierController } from "../controllers/suppliers/fetch-many-supplier-controller";
import { UpdateSupplierController } from "../controllers/suppliers/update-supplier-controller";

export const suppliersRouter = Router();

suppliersRouter.post("/suppliers", (request, response) =>
	CreateSupplierController.handle(request, response),
);

suppliersRouter.put("/suppliers/:supplierId", (request, response) =>
	UpdateSupplierController.handle(request, response),
);

suppliersRouter.delete("/suppliers/:supplierId", (request, response) =>
	DeleteSupplierController.handle(request, response),
);

suppliersRouter.get("/suppliers", (request, response) =>
	FetchManySupplierController.handle(request, response),
);

suppliersRouter.get("/suppliers/:supplierId", (request, response) =>
	FetchByIdSupplierController.handle(request, response),
);
