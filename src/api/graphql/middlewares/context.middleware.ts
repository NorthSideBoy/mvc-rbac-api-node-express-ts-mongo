import type { MiddlewareFn } from "type-graphql";
import type { GraphQLContext } from "../../../types/graphql-context.type";
import { contextualize } from "../../common/context.common";

export function contextMiddleware(): MiddlewareFn<GraphQLContext> {
	return async ({ context }, next) => {
		const { req } = context;
		const ctx = contextualize(req.access);
		req.context = ctx;
		return await next();
	};
}
