import z from "zod";
import { dateSchema, querySchema } from "../../../schemas/common.schemas";
import { roleSchema } from "../../../schemas/user.schemas";

export const searchUsersCodec = z
	.object({
		page: querySchema.number.optional(),
		limit: querySchema.number.max(100).optional(),
		sort: querySchema.string.optional(),
		search: querySchema.string.optional(),

		role: roleSchema.optional(),
		enable: querySchema.boolean.optional(),
		firstname: querySchema.string.optional(),
		lastname: querySchema.string.optional(),
		email: querySchema.string.optional(),
		username: querySchema.string.optional(),
		birthdayFrom: dateSchema.optional(),
		birthdayTo: dateSchema.optional(),

		createdAtFrom: dateSchema.optional(),
		createdAtTo: dateSchema.optional(),
	})
	.strict();
