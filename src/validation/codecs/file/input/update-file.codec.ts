import z from "zod";
import { CreateFileCodec } from "./create-file.codec";

export const UpdateFileCodec = z
	.object(CreateFileCodec.optional())
	.partial()
	.strict()
	.refine(
		(data) => Object.values(data).some((value) => value !== undefined),
		"At least one field must be provided",
	);
