import { Mimetype } from "../enums/mimetype.enum";

export function extToMimetype(ext: string): Mimetype {
	switch (ext.toLowerCase().replace(".", "")) {
		case "jpg":
		case "jpeg":
			return Mimetype.JPEG;
		case "png":
			return Mimetype.PNG;
		case "pdf":
			return Mimetype.PDF;
		default:
			throw new TypeError(`Unknown ext: ${ext}`);
	}
}

export function mimetypeToExt(mimetype: Mimetype): string {
	switch (mimetype) {
		case Mimetype.JPEG:
			return "jpg";
		case Mimetype.PNG:
			return "png";
		case Mimetype.PDF:
			return "pdf";
		default:
			throw new TypeError(`Unknown mime: ${mimetype}`);
	}
}
