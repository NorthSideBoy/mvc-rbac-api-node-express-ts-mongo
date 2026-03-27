import rateLimit from "express-rate-limit";
import { config } from "../../../configs/env.config";
import TooManyRequestsError from "../../../errors/http/to-many-requests.error";

export const generalLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs * 60 * 1000,
	max: config.rateLimit.max,
	standardHeaders: true,
	legacyHeaders: false,
	handler: () => {
		throw new TooManyRequestsError(
			"Too many attempts, please try again later.",
		);
	},
	skip: (req) => {
		if (req.path === "/graphql" && req.method === "POST") {
			if (req.body?.query) {
				const query = req.body.query;
				return (
					query.includes("__schema") || query.includes("IntrospectionQuery")
				);
			}
		}
		return false;
	},
});

export const authLimiter = rateLimit({
	windowMs: config.rateLimit.windowMs * 60 * 1000,
	max: 5,
	skipSuccessfulRequests: true,
	handler: () => {
		throw new TooManyRequestsError(
			"Too many attempts, please try again later.",
		);
	},
});
