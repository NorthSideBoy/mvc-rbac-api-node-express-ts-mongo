import moment from "moment";
import { ObjectId } from "mongodb";
import z from "zod";
import { Mimetype } from "../../enums/mimetype.enum";

export const idSchema = z
	.string()
	.refine((val) => ObjectId.isValid(val), { message: "Invalid ID" });

export const urlSchema = z.url("Invalid url");

export const jwtSchema = z
	.string()
	.regex(
		/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
		"Invalid token (JWT)",
	);

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
			if (Number.isNaN(val.getTime())) throw new Error("Invalid date value");
			return val;
		}
		if (/^\d{4}-\d{2}-\d{2}$/.test(val))
			return moment.utc(val, "YYYY-MM-DD").toDate();
		return moment.utc(val).toDate();
	})
	.refine((date) => moment(date).isValid(), {
		message: "Invalid date value",
	});

export const fileSchema = z
	.file()
	.min(1)
	.max(5 * 1024 * 1024)
	.mime(Object.values(Mimetype));

export const imageSchema = z
	.file()
	.min(1)
	.max(2 * 1024 * 1024)
	.mime([Mimetype.JPEG, Mimetype.PNG]);
