import { z } from "zod";
import { dateSchema, querySchema } from "../../schemas/common.schemas";
import { roleSchema } from "../../schemas/user.schemas";

export const searchUsersCodec = z
	.object({
		page: z.coerce.number().int().min(1).optional(),
		limit: z.coerce.number().int().min(1).max(100).optional(),
		sort: z.string().trim().min(1).optional(),
		search: z.string().trim().min(1).optional(),
		role: roleSchema.optional(),
		enable: querySchema.boolean.optional(),
		firstname: z.string().trim().min(1).optional(),
		lastname: z.string().trim().min(1).optional(),
		email: z.string().trim().min(1).optional(),
		username: z.string().trim().min(1).optional(),
		birthdayFrom: dateSchema.optional(),
		birthdayTo: dateSchema.optional(),
		createdAtFrom: dateSchema.optional(),
		createdAtTo: dateSchema.optional(),
	})
	.strict();
