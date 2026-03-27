import type { Server, Socket } from "socket.io";
import { logger } from "../../../utils/logger.util";
import type { BaseGateway } from "./base.gateway";
import UserGateway from "./user.gateway";

const items: BaseGateway[] = [];

export const gateways = {
	initialize: (io: Server): number => {
		if (items.length) {
			logger.info("[Socket.IO] gateways already initialized");
			return items.length;
		}
		items.push(new UserGateway(io));
		logger.info(`[Socket.IO] gateways initialized: ${items.length}`);
		return items.length;
	},
	register: (socket: Socket): number =>
		items.reduce((sum, g) => sum + g.register(socket), 0),
	shutdown: (): number => {
		const total = items.length;
		items.splice(0, items.length);
		logger.info(`[Socket.IO] gateways stopped: ${total}`);
		return total;
	},
};
