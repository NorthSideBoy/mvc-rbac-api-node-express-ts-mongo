import z from "zod";
import { dateSchema, idSchema } from "../../../schemas/common.schemas";
import {
	emailSchema,
	firstnameSchema,
	lastnameSchema,
	roleSchema,
	usernameSchema,
} from "../../../schemas/user.schemas";
import { fileCodec } from "../../file/output/file.codec";

export const userCodec = z
	.object({
		id: idSchema,
		firstname: firstnameSchema,
		lastname: lastnameSchema,
		username: usernameSchema,
		email: emailSchema,
		picture: fileCodec.or(idSchema),
		birthday: dateSchema,
		enable: z.boolean().default(true),
		role: roleSchema,
		createdAt: dateSchema,
		updatedAt: dateSchema,
	})
	.strict();
