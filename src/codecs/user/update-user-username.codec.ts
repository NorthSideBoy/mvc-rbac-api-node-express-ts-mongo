import { z } from "zod";
import { usernameSchema } from "./fields.schema";

export const updateUserUsernameCodec = z
	.object({
		username: usernameSchema,
	})
	.strict();
