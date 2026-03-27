import type { Server } from "socket.io";
import { logger } from "../../../utils/logger.util";
import type { BaseBridge } from "./base.bridge";
import UserBridge from "./user.bridge";

const items: BaseBridge[] = [];

export const bridges = {
	initialize: (io: Server): number => {
		if (items.length) {
			logger.info("[Socket.IO] bridges already initialized");
			return items.length;
		}
		items.push(new UserBridge(io));
		const total = items.reduce((sum, b) => sum + b.setup(), 0);
		logger.info(`[Socket.IO] bridges initialized: ${total}`);
		return total;
	},
	shutdown: (): number => {
		if (!items.length) {
			logger.info("[Socket.IO] bridges already stopped");
			return 0;
		}
		const total = items.reduce((sum, b) => sum + b.shutdown(), 0);
		items.splice(0, items.length);
		logger.info(`[Socket.IO] bridges stopped: ${total}`);
		return total;
	},
};
