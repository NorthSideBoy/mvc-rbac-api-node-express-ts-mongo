import z from "zod";
import { filenameSchema, pathSchema } from "../../../schemas/file.schemas";

export const readFileCodec = z
	.object({
		filename: filenameSchema,
		filepath: pathSchema,
	})
	.strict();
