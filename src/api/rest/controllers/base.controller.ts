import { Controller } from "tsoa";
import { createFile } from "../../../factories/file.factory";

export class BaseController extends Controller {
	protected handleUpload(file?: Express.Multer.File): File | undefined {
		if (!file) return undefined;
		return createFile(file.buffer, file.originalname, {
			type: file.mimetype,
		});
	}
}
