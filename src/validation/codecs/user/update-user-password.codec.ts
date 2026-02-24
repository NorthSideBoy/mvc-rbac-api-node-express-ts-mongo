import { z } from "zod";
import { passwordSchema } from "../../schemas/user.schemas";

export const updateUserPasswordCodec = z
	.object({
		password: passwordSchema,
	})
	.strict();
