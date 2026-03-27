import type { MiddlewareFn } from "type-graphql";
import type { Role } from "../../../enums/role.enum";
import { authorize } from "../../common/utils/auth.util";
import type { GraphQLContext } from "../types/graphql-context.type";

export function authGuard(
	securityName: string,
	allowed: Role[],
): MiddlewareFn<GraphQLContext> {
	return async ({ context }, next) => {
		const { req } = context;
		req.access = await authorize(
			req.headers.authorization,
			securityName,
			allowed,
		);
		return await next();
	};
}
