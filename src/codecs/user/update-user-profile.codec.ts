import { z } from "zod";
import {
	birthdaySchema,
	firstnameSchema,
	lastnameSchema,
} from "./fields.schema";

export const updateUserProfileCodec = z
	.object({
		firstname: firstnameSchema.optional(),
		lastname: lastnameSchema.optional(),
		birthday: birthdaySchema.optional(),
	})
	.partial()
	.strict()
	.refine(
		(data) => Object.values(data).some((value) => value !== undefined),
		"At least one field must be provided",
	);
