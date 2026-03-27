import type { MiddlewareFn } from "type-graphql";
import { contextualize } from "../../common/utils/context.util";
import type { GraphQLContext } from "../types/graphql-context.type";

export function contextMiddleware(): MiddlewareFn<GraphQLContext> {
	return async ({ context }, next) => {
		const { req } = context;
		const ctx = contextualize(req.access);
		req.context = ctx;
		return await next();
	};
}
