import { RateLimiterMemory } from "rate-limiter-flexible";
import type { MiddlewareFn } from "type-graphql";
import { config } from "../../../configs/env.config";
import TooManyRequestsError from "../../../errors/http/to-many-requests.error";
import type { GraphQLContext } from "../types/graphql-context.type";

const rateLimiter = new RateLimiterMemory({
	points: 5,
	duration: config.rateLimit.max * 60,
	blockDuration: config.rateLimit.windowMs * 60,
});

export function authLimiter(): MiddlewareFn<GraphQLContext> {
	return async ({ context }, next) => {
		const { req } = context;
		const clientIp = req.ip || "unknown";
		try {
			await rateLimiter.get(clientIp).catch();
			const result = await next();
			return result;
		} catch (error) {
			await rateLimiter.consume(clientIp).catch(() => {
				throw new TooManyRequestsError(
					"Too many attempts, please try again later.",
				);
			});
			throw error;
		}
	};
}
