import z from "zod";

export const resultCodec = z
	.object({
		success: z.boolean(),
		affected: z.number().int().min(0),
	})
	.strict();
