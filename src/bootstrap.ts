import { env } from "./configs/env.config";
import { Database } from "./configs/mongoose.config";
import { logger } from "./utils/logger.util";

export const bootstrap = async (): Promise<void> => {
	logger.info({ mode: env.NODE_ENV }, "[APP] starting");
	await Database.connect();
};

export const shutdown = async (): Promise<void> => {
	await Database.disconnect();
	logger.info("[APP] stopped");
};
