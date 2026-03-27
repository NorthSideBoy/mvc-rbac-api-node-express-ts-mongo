import type { RequestHandler } from "express";
import { context } from "../../../utils/context.util";
import type { ExtendedRequest } from "../../common/types/extended-request.type";
import { contextualize } from "../../common/utils/context.util";

export const contextMiddleware: RequestHandler = (
	request: ExtendedRequest,
	_response,
	next,
) => {
	const ctx = contextualize(request.access);
	request.context = ctx;
	context.run(ctx, () => {
		next();
	});
};
