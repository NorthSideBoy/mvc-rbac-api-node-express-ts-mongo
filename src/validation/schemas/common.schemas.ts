import moment from "moment";
import z from "zod";

export const querySchema = {
	boolean: z.preprocess((val) => {
		if (typeof val !== "string") return val;
		const normalized = val.trim().toLowerCase();
		return normalized === "true" || normalized === "1"
			? true
			: normalized === "false" || normalized === "0"
				? false
				: val;
	}, z.boolean()),
};

export const dateSchema = z
	.union([
		z.string().refine(
			(val) => {
				const hasValidFormat =
					/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/.test(val);
				if (!hasValidFormat) return false;
				if (/^\d{4}-\d{2}-\d{2}$/.test(val))
					return moment(val, "YYYY-MM-DD", true).isValid();
				return moment(val, moment.ISO_8601, true).isValid();
			},
			{
				message:
					"Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ",
			},
		),
		z.date(),
	])
	.transform((val) => {
		if (val instanceof Date) {
			if (isNaN(val.getTime())) throw new Error("Invalid date value");
			return val;
		}
		if (/^\d{4}-\d{2}-\d{2}$/.test(val))
			return moment.utc(val, "YYYY-MM-DD").toDate();
		return moment.utc(val).toDate();
	})
	.refine((date) => moment(date).isValid(), {
		message: "Invalid date value",
	});

export const fileSchema = z.file();
