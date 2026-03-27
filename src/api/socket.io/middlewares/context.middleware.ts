import { context } from "../../../utils/context.util";
import { contextualize } from "../../common/utils/context.util";
import type { SocketEventMiddleware } from "../types/socket-event-middleware.type";

export function contextMiddleware(): SocketEventMiddleware {
	return async (ctx, next) => {
		ctx.context = contextualize(ctx.access);
		ctx.socket.data.context = ctx.context;

		await context.runAsync(ctx.context, async () => {
			await next();
		});
	};
}
