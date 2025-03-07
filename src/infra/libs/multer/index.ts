import multer from "multer";

const multerConfig: multer.Options = {
	storage: multer.memoryStorage(),
};

export const upload = multer(multerConfig);	