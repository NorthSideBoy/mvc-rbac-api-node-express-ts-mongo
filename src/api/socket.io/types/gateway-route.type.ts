import type {
	SocketEventHandler,
	SocketEventMiddleware,
} from "./socket-event-middleware.type";
import type { SocketLifecycle } from "./socket-lifecycle.type";

export type GatewayRouteMeta = {
	methodName: string;
	eventName?: string;
	lifecycle?: SocketLifecycle;
	middlewares: SocketEventMiddleware[];
};

export type GatewayRoute = GatewayRouteMeta & {
	handler: SocketEventHandler;
};
