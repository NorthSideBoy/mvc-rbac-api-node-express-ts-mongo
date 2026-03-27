import type { Server } from "socket.io";
import type ExecutionContext from "../../../context/execution-context";
import { eventBus } from "../../../events/core/event-bus";
import type { Event } from "../../../events/types/event.type";
import type { EventMap } from "../../../events/types/event-map.type";
import { logger } from "../../../utils/logger.util";

export abstract class BaseBridge {
	protected counter = 0;
	private readonly unsubscribers: Array<() => void> = [];

	constructor(protected readonly io: Server) {}

	abstract setup(): number;

	protected listen<K extends keyof EventMap>(
		name: K,
		handler: (event: Event<K>, context: ExecutionContext) => Promise<void>,
	): void {
		const unsubscribe = eventBus.subscribe(name, async (event, ctx) => {
			try {
				logger.info(`[Socket.IO] processing event: ${String(name)}`);
				await handler(event, ctx);
				logger.info(
					`[Socket.IO] successfully processed event: ${String(name)}`,
				);
			} catch (error) {
				logger.error(
					{ error, event },
					`[Socket.IO] error processing event: ${String(name)}`,
				);
				throw error;
			}
		});
		this.unsubscribers.push(unsubscribe);
		this.counter++;
	}

	protected publish<K extends keyof EventMap>(
		name: K,
		payload: EventMap[K],
	): boolean {
		this.io.emit(name, payload);
		return true;
	}

	protected publishToRoom<K extends keyof EventMap>(
		room: string,
		name: K,
		payload: EventMap[K],
	): boolean {
		this.io.to(room).emit(name, payload);
		return true;
	}

	shutdown(): number {
		const total = this.unsubscribers.length;
		this.unsubscribers.forEach((unsub) => {
			unsub();
		});
		this.unsubscribers.length = 0;
		this.counter = 0;
		return total;
	}
}
