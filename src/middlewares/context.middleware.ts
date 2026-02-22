import type { RequestHandler } from "express";
import { ExecutionContext } from "../context/execution-context";
import type { ExtendedRequest } from "../types/extended-request.type";
import { context } from "../context/context.service";

export const contextMiddleware: RequestHandler = (
	request: ExtendedRequest,
	_response,
	next,
) => {
	const ctx = request.access
		? ExecutionContext.fromGrant(request.access)
		: ExecutionContext.anonymous();

	request.context = ctx
	context.run(ctx, () => {
		next();
	});
};
