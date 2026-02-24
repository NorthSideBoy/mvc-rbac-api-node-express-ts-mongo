import rateLimit from "express-rate-limit";
import { env } from "../../../configs/env.config";
import TooManyRequestsError from "../../../errors/http/to-many-requests.error";

export const generalLimiter = rateLimit({
	windowMs: env.RATE_LIMIT.WINDOW * 60 * 1000,
	max: env.RATE_LIMIT.MAX,
	standardHeaders: true,
	legacyHeaders: false,
	handler: () => {
		throw new TooManyRequestsError(
			"Too many attempts, please try again later.",
		);
	},
});

export const authLimiter = rateLimit({
	windowMs: env.RATE_LIMIT.WINDOW * 60 * 1000,
	max: 5,
	skipSuccessfulRequests: true,
	handler: () => {
		throw new TooManyRequestsError(
			"Too many attempts, please try again later.",
		);
	},
});
