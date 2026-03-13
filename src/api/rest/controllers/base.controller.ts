import { Controller } from "tsoa";

export class BaseController extends Controller {
	protected handleFile(file?: Express.Multer.File): File | undefined {
		if (!file) return undefined;
		const uint8Array = new Uint8Array(file.buffer);
		const native = new File([uint8Array], file.originalname, {
			type: file.mimetype,
			lastModified: Date.now(),
		});
		return native;
	}
}
