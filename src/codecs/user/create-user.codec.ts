import { z } from "zod";
import {
	birthdaySchema,
	emailSchema,
	enableSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	roleSchema,
	usernameSchema,
} from "./fields.schema";

export const createUserCodec = z
	.object({
		firstname: firstnameSchema,
		lastname: lastnameSchema,
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		birthday: birthdaySchema,
		enable: enableSchema,
		role: roleSchema,
	})
	.strict();
