import type { Server, Socket } from "socket.io";
import { isCoreError } from "../../../guards/error.guard";
import { logger } from "../../../utils/logger.util";
import { getGatewayRoutes } from "../decorators/socket.decorator";
import type { GatewayRoute } from "../types/gateway-route.type";
import type { SocketEventContext } from "../types/socket-event-context.type";
import type {
	SocketEventHandler,
	SocketEventMiddleware,
} from "../types/socket-event-middleware.type";

export abstract class BaseGateway {
	private routesCache: GatewayRoute[] | null = null;

	constructor(protected readonly io: Server) {}

	register(socket: Socket): number {
		const routes = this.getRoutes();
		let counter = 0;

		for (const route of routes) {
			if (route.lifecycle === "connect") {
				void this.dispatch(route, socket, "$connect", []);
				counter++;
			} else if (route.lifecycle === "disconnect") {
				socket.on(
					"disconnect",
					(reason) => void this.dispatch(route, socket, "disconnect", [reason]),
				);
				counter++;
			} else if (route.eventName) {
				const eventName = route.eventName;
				socket.on(
					eventName,
					(...args) => void this.dispatch(route, socket, eventName, args),
				);
				counter++;
			}
		}
		return counter;
	}

	private getRoutes(): GatewayRoute[] {
		if (this.routesCache) return this.routesCache;

		const metadata = getGatewayRoutes(this);
		this.routesCache = metadata
			.map((meta) => {
				const method = (this as Record<string, unknown>)[meta.methodName];
				return typeof method === "function"
					? { ...meta, handler: method.bind(this) as SocketEventHandler }
					: null;
			})
			.filter((r): r is GatewayRoute => r !== null);

		return this.routesCache;
	}

	private async dispatch(
		route: GatewayRoute,
		socket: Socket,
		eventName: string,
		rawArgs: unknown[],
	): Promise<void> {
		const ctx = this.buildContext(socket, eventName, rawArgs);
		try {
			await this.run(
				ctx,
				route.middlewares,
				async () => await route.handler(ctx),
			);
		} catch (error) {
			this.handleError(ctx, error);
		}
	}

	private buildContext(
		socket: Socket,
		eventName: string,
		rawArgs: unknown[],
	): SocketEventContext {
		const args = [...rawArgs];
		const maybeAck = args.at(-1);
		const ack =
			typeof maybeAck === "function"
				? (args.pop() as (...args: unknown[]) => void)
				: undefined;
		return {
			io: this.io,
			socket,
			eventName,
			payload: args[0],
			args,
			ack,
			access: socket.data.access,
			context: socket.data.context,
		};
	}

	private async run(
		ctx: SocketEventContext,
		middlewares: SocketEventMiddleware[],
		final: () => Promise<void>,
	): Promise<void> {
		let idx = -1;
		const next = async (i: number): Promise<void> => {
			if (i <= idx) throw new Error("next() called multiple times");
			idx = i;
			const mw = middlewares[i];
			if (!mw) return final();
			await mw(ctx, () => next(i + 1));
		};
		await next(0);
	}

	private handleError(ctx: SocketEventContext, error: unknown): void {
		const serialized = isCoreError(error)
			? { code: error.code, message: error.message }
			: { message: "Socket event failed" };
		logger.warn(
			{ event_name: ctx.eventName, socket_id: ctx.socket.id, error },
			"[Socket.IO] gateway event failed",
		);
		if (ctx.ack) ctx.ack({ ok: false, error: serialized });
		if (ctx.eventName === "$connect") ctx.socket.disconnect(true);
	}
}
