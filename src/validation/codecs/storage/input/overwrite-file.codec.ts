import z from "zod";
import { fileSchema } from "../../../schemas/common.schemas";
import { readFileCodec } from "./read-file.codec";

export const overwriteFileCodec = z
	.object({
		...readFileCodec.shape,
		file: fileSchema,
	})
	.strict();
