import z from "zod";

export const updateUserStatusCodec = z
	.object({
		enable: z.boolean(),
	})
	.strict();
