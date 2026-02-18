import { z } from "zod";
import { emailSchema } from "./fields.schema";

export const updateUserEmailCodec = z
	.object({
		email: emailSchema,
	})
	.strict();
