import type { ZodType } from "zod";

export const decode = <T>(schema: ZodType<unknown>, input: unknown): T => {
	const result = schema.safeParse(input);

	if (!result.success) throw result.error;

	return result.data as T;
};
