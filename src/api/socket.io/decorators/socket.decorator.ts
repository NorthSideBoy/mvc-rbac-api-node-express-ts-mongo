import type { GatewayRouteMeta } from "../types/gateway-route.type";
import type { SocketEventMiddleware } from "../types/socket-event-middleware.type";
import type { SocketLifecycle } from "../types/socket-lifecycle.type";

type ConstructorLike = abstract new (...args: never[]) => unknown;

const EVENT = Symbol("socket:event");
const LIFECYCLE = Symbol("socket:lifecycle");
const METHOD_MID = Symbol("socket:method:middlewares");
const CLASS_MID = Symbol("socket:class:middlewares");

export function Gateway(): ClassDecorator {
	return () => {};
}

export function On(name: string): MethodDecorator {
	return (target, key) => {
		if (key) Reflect.defineMetadata(EVENT, name, target, key);
	};
}

export function OnConnect(): MethodDecorator {
	return (target, key) => {
		if (key) Reflect.defineMetadata(LIFECYCLE, "connect", target, key);
	};
}

export function OnDisconnect(): MethodDecorator {
	return (target, key) => {
		if (key) Reflect.defineMetadata(LIFECYCLE, "disconnect", target, key);
	};
}

function store(
	target: object | ConstructorLike,
	mws: SocketEventMiddleware[],
	key?: string | symbol,
) {
	if (key === undefined) {
		const existing: SocketEventMiddleware[] =
			Reflect.getMetadata(CLASS_MID, target) ?? [];
		Reflect.defineMetadata(CLASS_MID, [...existing, ...mws], target);
		return;
	}

	const existing: SocketEventMiddleware[] =
		Reflect.getMetadata(METHOD_MID, target, key) ?? [];
	Reflect.defineMetadata(METHOD_MID, [...existing, ...mws], target, key);
}

export function UseSocket(
	...middlewares: SocketEventMiddleware[]
): MethodDecorator & ClassDecorator {
	return ((target, key) => store(target, middlewares, key)) as MethodDecorator &
		ClassDecorator;
}

export function getGatewayRoutes(instance: object): GatewayRouteMeta[] {
	const proto = Object.getPrototypeOf(instance);
	const classMws: SocketEventMiddleware[] =
		Reflect.getMetadata(CLASS_MID, instance.constructor) ?? [];

	const methodNames = Object.getOwnPropertyNames(proto).filter(
		(n) => n !== "constructor",
	);

	return methodNames.flatMap((name) => {
		const event = Reflect.getMetadata(EVENT, proto, name) as string | undefined;
		const lifecycle = Reflect.getMetadata(LIFECYCLE, proto, name) as
			| SocketLifecycle
			| undefined;
		if (!event && !lifecycle) return [];

		const methodMws: SocketEventMiddleware[] =
			Reflect.getMetadata(METHOD_MID, proto, name) ?? [];

		return [
			{
				methodName: name,
				eventName: event,
				lifecycle,
				middlewares: [...classMws, ...methodMws],
			},
		];
	});
}
