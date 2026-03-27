import bcrypt from "bcrypt";
import dotenv from "dotenv";
import z from "zod";

dotenv.config({ quiet: true });

const toNumber = () =>
	z
		.string()
		.transform((val) => Number(val))
		.refine((val) => !Number.isNaN(val), {
			message: "Must be a valid number",
		});

const envSchema = z.object({
	// Common
	HOST: z.string().default("127.0.0.1"),
	NODE_ENV: z.enum(["development", "production"]).default("development"),
	PORT: toNumber().default(3000),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

	// Database configuration
	DB_HOST: z.string().default("127.0.0.1"),
	DB_PORT: toNumber().default(27017),
	DB_NAME: z.string().nonempty(),
	DB_USER: z.string().nonempty(),
	DB_PASSWORD: z.string().nonempty(),
	DB_AUTH_SOURCE: z.string().default("admin"),
	DATABASE_URL: z.string(),

	// Socket.io admin-ui
	SOCKET_ADMIN_USERNAME: z.string().nonempty(),
	SOCKET_ADMIN_PASSWORD: z
		.string()
		.nonempty()
		.transform((val) => bcrypt.hashSync(val, 10)),

	// JWT Configuration
	JWT_SECRET: z.string().nonempty(),
	JWT_EXPIRES_IN: z
		.string()
		.regex(/^\d+(ms|s|m|h|d|w)$/, {
			message: "Invalid expiration format. Use: 1ms, 1s, 1m, 1h, 1d, 1w",
		})
		.default("1h"),

	// Cors
	CORS_ORIGIN: z.string().default("*"),

	// Rate Limit
	RATE_LIMIT_WINDOW: toNumber().default(15),
	RATE_LIMIT_MAX: toNumber().default(500),

	// File
	MAX_FILE_SIZE: toNumber().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const errorMessages = parsed.error.issues.map(
		(issue) => `${issue.path.join(".")}: ${issue.message}`,
	);
	throw new Error(
		`Environment validation failed:\n${errorMessages.join("\n")}`,
	);
}

const env = parsed.data;

const buildMongoUri = (): string => {
	if (!env.DATABASE_URL || env.DATABASE_URL.includes("${")) {
		const user = encodeURIComponent(env.DB_USER);
		const password = encodeURIComponent(env.DB_PASSWORD);
		return `mongodb://${user}:${password}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}?authSource=${env.DB_AUTH_SOURCE}&directConnection=true`;
	}
	return env.DATABASE_URL;
};

const buildPublicUrl = (): string => {
	const protocol = env.NODE_ENV === "production" ? "https" : "http";
	return `${protocol}://${env.HOST}:${env.PORT}`;
};

const databaseUrl = buildMongoUri();
const maskedDatabaseUrl = databaseUrl.replace(
	/(:\/\/[^:]+:)[^@]+(@)/,
	"$1*****$2",
);

export const config = Object.freeze({
	server: {
		host: env.HOST,
		port: env.PORT,
		nodeEnv: env.NODE_ENV,
		logLevel: env.LOG_LEVEL,
		publicUrl: buildPublicUrl(),
		isProduction: env.NODE_ENV === "production",
		isDevelopment: env.NODE_ENV === "development",
	},
	database: {
		host: env.DB_HOST,
		port: env.DB_PORT,
		name: env.DB_NAME,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		authSource: env.DB_AUTH_SOURCE,
		connection: {
			uri: databaseUrl,
			maskedUri: maskedDatabaseUrl,
		},
	},
	socketAdmin: {
		username: env.SOCKET_ADMIN_USERNAME,
		password: env.SOCKET_ADMIN_PASSWORD,
	},
	jwt: {
		secret: env.JWT_SECRET,
		expiresIn: env.JWT_EXPIRES_IN,
	},
	cors: {
		origin: env.CORS_ORIGIN,
	},
	rateLimit: {
		windowMs: env.RATE_LIMIT_WINDOW,
		max: env.RATE_LIMIT_MAX,
	},
	file: {
		max_size: env.MAX_FILE_SIZE,
	},
} as const);

export type Config = typeof config;
