import { z } from "zod";
import { dateSchema } from "../../schemas/common.schemas";
import {
	emailSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	usernameSchema,
} from "../../schemas/user.schemas";

export const registerUserCodec = z
	.object({
		firstname: firstnameSchema,
		lastname: lastnameSchema,
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		birthday: dateSchema,
		enable: z.boolean().default(true),
	})
	.strict();
