import { logger } from "../utils/logger.util";
import AuthListener from "./auth.listener";
import type { BaseListener } from "./base.listener";
import UserListener from "./user.listener";

const items: BaseListener[] = [];

export const listeners = {
	initialize: () => {
		if (items.length > 0) {
			logger.info("[EventBus] event listeners already initialized");
			return items.length;
		}

		let counter = 0;
		items.push(new AuthListener(), new UserListener());
		for (const listener of items) counter += listener.setup();
		logger.info(`[EventBus] event listeners: ${counter}`);
		return counter;
	},
	shutdown: () => {
		if (items.length === 0) {
			logger.info("[EventBus] event listeners already stopped");
			return 0;
		}

		let counter = 0;
		for (const listener of items) counter += listener.shutdown();
		items.splice(0, items.length);
		logger.info(`[EventBus] event listeners stopped: ${counter}`);
		return counter;
	},
};
