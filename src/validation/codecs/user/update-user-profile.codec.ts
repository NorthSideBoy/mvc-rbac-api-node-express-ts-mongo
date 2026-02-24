import { z } from "zod";
import { dateSchema } from "../../schemas/common.schemas";
import { firstnameSchema, lastnameSchema } from "../../schemas/user.schemas";

export const updateUserProfileCodec = z
	.object({
		firstname: firstnameSchema.optional(),
		lastname: lastnameSchema.optional(),
		birthday: dateSchema.optional(),
	})
	.partial()
	.strict()
	.refine(
		(data) => Object.values(data).some((value) => value !== undefined),
		"At least one field must be provided",
	);
