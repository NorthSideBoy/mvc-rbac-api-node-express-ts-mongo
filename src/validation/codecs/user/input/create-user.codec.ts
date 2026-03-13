import z from "zod";
import { dateSchema, imageSchema } from "../../../schemas/common.schemas";
import {
	emailSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	roleSchema,
	usernameSchema,
} from "../../../schemas/user.schemas";

export const createUserCodec = z
	.object({
		firstname: firstnameSchema,
		lastname: lastnameSchema,
		username: usernameSchema,
		email: emailSchema,
		role: roleSchema,
		picture: imageSchema.optional(),
		password: passwordSchema,
		birthday: dateSchema,
		enable: z.boolean().default(true),
	})
	.strict();
