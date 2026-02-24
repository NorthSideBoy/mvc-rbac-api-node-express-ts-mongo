import { z } from "zod";
import { updateRoleSchema } from "../../schemas/user.schemas";

export const updateUserRoleCodec = z
	.object({
		role: updateRoleSchema,
	})
	.strict();
