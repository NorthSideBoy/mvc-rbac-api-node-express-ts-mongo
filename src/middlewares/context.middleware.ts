import type { RequestHandler } from "express";
import { context } from "../context/context.handler";
import ExecutionContext from "../context/execution-context";
import type { ExtendedRequest } from "../types/extended-request.type";

export const contextMiddleware: RequestHandler = (
	request: ExtendedRequest,
	_response,
	next,
) => {
	const ctx = request.access
		? ExecutionContext.fromGrant(request.access)
		: ExecutionContext.anonymous();

	request.context = ctx;
	context.run(ctx, () => {
		next();
	});
};
