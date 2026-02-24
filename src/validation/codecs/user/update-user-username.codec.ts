import { z } from "zod";
import { usernameSchema } from "../../schemas/user.schemas";

export const updateUserUsernameCodec = z
	.object({
		username: usernameSchema,
	})
	.strict();
