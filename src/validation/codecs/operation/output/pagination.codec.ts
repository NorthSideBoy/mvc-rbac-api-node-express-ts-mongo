import z from "zod";

export const paginationCodec = z
	.object({
		page: z.number().int().min(1),
		limit: z.number().int().min(1),
		total: z.number().int().min(0),
		pages: z.number().int().min(0),
		hasNext: z.boolean(),
		hasPrev: z.boolean(),
	})
	.strict();
