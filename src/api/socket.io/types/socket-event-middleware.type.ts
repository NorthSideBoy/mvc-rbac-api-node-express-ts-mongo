import type { SocketEventContext } from "./socket-event-context.type";

export type SocketEventNext = () => Promise<void>;

export type SocketEventMiddleware<TPayload = unknown> = (
	context: SocketEventContext<TPayload>,
	next: SocketEventNext,
) => Promise<void>;

export type SocketEventHandler<TPayload = unknown> = (
	context: SocketEventContext<TPayload>,
) => Promise<void> | void;
