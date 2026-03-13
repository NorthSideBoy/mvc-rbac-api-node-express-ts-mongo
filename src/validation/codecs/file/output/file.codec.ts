import z from "zod";
import {
	dateSchema,
	idSchema,
	urlSchema,
} from "../../../schemas/common.schemas";
import {
	altSchema,
	extSchema,
	filenameSchema,
	mimetypeSchema,
	pathSchema,
	sizeSchema,
	visibilitySchema,
} from "../../../schemas/file.schemas";

export const fileCodec = z
	.object({
		id: idSchema,
		alt: altSchema,
		filename: filenameSchema,
		size: sizeSchema,
		mimetype: mimetypeSchema,
		path: pathSchema,
		ext: extSchema,
		url: urlSchema,
		visibility: visibilitySchema,
		createdAt: dateSchema,
		updatedAt: dateSchema,
	})
	.strict();
