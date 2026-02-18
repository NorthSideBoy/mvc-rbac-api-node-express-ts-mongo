import { z } from "zod";
import {
	birthdaySchema,
	emailSchema,
	enableSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	usernameSchema,
} from "./fields.schema";

export const registerUserCodec = z
	.object({
		firstname: firstnameSchema,
		lastname: lastnameSchema,
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		birthday: birthdaySchema,
		enable: enableSchema,
	})
	.strict();
