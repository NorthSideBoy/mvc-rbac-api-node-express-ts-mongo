import type z from "zod";

export function parseSchema<T>(schema: z.ZodSchema<T>) {
	return (value: unknown): string | boolean => {
		const result = schema.safeParse(value);
		if (result.success) {
			return true;
		}
		const errors = result.error.issues.map((err) => err.message).join(", ");
		return errors;
	};
}
