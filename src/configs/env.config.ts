import dotenv from "dotenv";
import { z } from "zod";
import {
	birthdaySchema,
	emailSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	usernameSchema,
} from "../codecs/user/fields.schema";
import type { User } from "../types/user.type";

dotenv.config();

const toNumber = () =>
	z
		.string()
		.transform((val) => Number(val))
		.refine((val) => !Number.isNaN(val), {
			message: "Must be a valid number",
		});

const envSchema = z.object({
	HOST: z.string().default("127.0.0.1"),
	NODE_ENV: z.enum(["development", "production"]).default("development"),
	PORT: toNumber().default(3000),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

	ADMIN_FIRSTNAME: firstnameSchema,
	ADMIN_LASTNAME: lastnameSchema,
	ADMIN_USERNAME: usernameSchema,
	ADMIN_EMAIL: emailSchema,
	ADMIN_PASSWORD: passwordSchema,
	ADMIN_BIRTHDAY: birthdaySchema,

	DB_HOST: z.string().default("127.0.0.1"),
	DB_PORT: toNumber().default(27017),
	DB_NAME: z.string(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_AUTH_SOURCE: z.string().default("admin"),
	DATABASE_URL: z.string(),

	JWT_SECRET: z.string().nonempty(),
	JWT_EXPIRES_IN: z
		.string()
		.regex(/^\d+(ms|s|m|h|d|w)$/)
		.default("1h"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const messages = parsed.error.issues.map(
		(issue) => `${issue.path.join(".")}: ${issue.message}`,
	);
	throw new Error(messages.toString());
}

const e = parsed.data;

const buildMongoUrl = (): string => {
	if (!e.DATABASE_URL || e.DATABASE_URL.includes("${")) {
		const user = encodeURIComponent(e.DB_USER);
		const password = encodeURIComponent(e.DB_PASSWORD);
		return `mongodb://${user}:${password}@${e.DB_HOST}:${e.DB_PORT}/${e.DB_NAME}?authSource=${e.DB_AUTH_SOURCE}&directConnection=true`;
	}
	return e.DATABASE_URL;
};

const ADMIN: User.Env = {
	firstname: e.ADMIN_FIRSTNAME,
	lastname: e.ADMIN_LASTNAME,
	username: e.ADMIN_USERNAME,
	email: e.ADMIN_EMAIL,
	password: e.ADMIN_PASSWORD,
	birthday: e.ADMIN_BIRTHDAY,
};

export const env = Object.freeze({
	HOST: e.HOST,
	NODE_ENV: e.NODE_ENV,
	PORT: e.PORT,
	LOG_LEVEL: e.LOG_LEVEL,

	DB: {
		HOST: e.DB_HOST,
		PORT: e.DB_PORT,
		NAME: e.DB_NAME,
		USER: e.DB_USER,
		PASSWORD: e.DB_PASSWORD,
		AUTH_SOURCE: e.DB_AUTH_SOURCE,
		URL: buildMongoUrl(),
	},

	ADMIN,

	JWT: {
		SECRET: e.JWT_SECRET,
		EXPIRES_IN: e.JWT_EXPIRES_IN,
	},
});
