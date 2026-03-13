import z from "zod";
import { fileSchema } from "../../../schemas/common.schemas";
import { filenameSchema, pathSchema } from "../../../schemas/file.schemas";

export const overwriteFileCodec = z
	.object({
		filepath: pathSchema,
		filename: filenameSchema,
		file: fileSchema,
	})
	.strict();
