import z from "zod";
import {
	altSchema,
	extSchema,
	filenameSchema,
	mimetypeSchema,
	pathSchema,
	sizeSchema,
	visibilitySchema,
} from "../../../schemas/file.schemas";

export const CreateFileCodec = z
	.object({
		alt: altSchema,
		filename: filenameSchema,
		size: sizeSchema,
		mimetype: mimetypeSchema,
		ext: extSchema,
		path: pathSchema,
		visibility: visibilitySchema.optional(),
	})
	.strict();
