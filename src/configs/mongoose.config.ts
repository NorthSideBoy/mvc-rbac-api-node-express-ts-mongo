import mongoose from "mongoose";
import { logger } from "../utils/logger.util";
import { env } from "./env.config";

export const Database = {
	async connect(): Promise<void> {
		try {
			await mongoose.connect(env.DB.URL.PUBLIC);

			logger.info({ URI: env.DB.URL.MASK }, "[MongoDB] connected");
		} catch (error) {
			logger.error("[MongoDB] connection error");
			throw error;
		}
	},

	async disconnect(): Promise<void> {
		await mongoose.disconnect();
		logger.info("[MongoDB] disconnected");
	},
};
