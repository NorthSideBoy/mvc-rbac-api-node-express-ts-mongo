import { z } from "zod";
import { roleSchema } from "./fields.schema";

const dateQuerySchema = z
	.union([
		z.string().refine(
			(val) => {
				const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
				const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
				return isoRegex.test(val) || dateOnlyRegex.test(val);
			},
			{
				message:
					"Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ",
			},
		),
		z.date(),
	])
	.transform((val) => (typeof val === "string" ? new Date(val) : val));

const booleanQuerySchema = z.preprocess((value) => {
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") return true;
		if (normalized === "false") return false;
	}
	return value;
}, z.boolean());

export const searchUsersCodec = z
	.object({
		page: z.coerce.number().int().min(1).optional(),
		limit: z.coerce.number().int().min(1).max(100).optional(),
		sort: z.string().trim().min(1).optional(),
		search: z.string().trim().min(1).optional(),
		role: roleSchema.optional(),
		enable: booleanQuerySchema.optional(),
		firstname: z.string().trim().min(1).optional(),
		lastname: z.string().trim().min(1).optional(),
		email: z.string().trim().min(1).optional(),
		username: z.string().trim().min(1).optional(),
		birthdayFrom: dateQuerySchema.optional(),
		birthdayTo: dateQuerySchema.optional(),
		createdAtFrom: dateQuerySchema.optional(),
		createdAtTo: dateQuerySchema.optional(),
	})
	.strict();
