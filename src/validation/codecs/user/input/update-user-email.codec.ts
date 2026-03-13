import z from "zod";
import { emailSchema } from "../../../schemas/user.schemas";

export const updateUserEmailCodec = z
	.object({
		email: emailSchema,
	})
	.strict();
