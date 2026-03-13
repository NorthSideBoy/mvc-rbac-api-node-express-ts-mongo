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

export const UpdateFileCodec = z
	.object({
		alt: altSchema.optional(),
		filename: filenameSchema.optional(),
		size: sizeSchema.optional(),
		mimetype: mimetypeSchema.optional(),
		ext: extSchema.optional(),
		path: pathSchema.optional(),
		visibility: visibilitySchema.optional(),
	})
	.partial()
	.strict()
	.refine(
		(data) => Object.values(data).some((value) => value !== undefined),
		"At least one field must be provided",
	);
