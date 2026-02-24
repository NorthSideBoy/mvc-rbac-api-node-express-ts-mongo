import { z } from "zod";
import { emailSchema, passwordSchema } from "../../schemas/user.schemas";

export const loginUserCodec = z
	.object({
		email: emailSchema,
		password: passwordSchema,
	})
	.strict();
