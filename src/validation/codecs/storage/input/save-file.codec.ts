import z from "zod";
import { fileSchema } from "../../../schemas/common.schemas";
import { pathSchema } from "../../../schemas/file.schemas";

export const saveFileCodec = z
	.object({
		file: fileSchema,
		filepath: pathSchema,
	})
	.strict();
