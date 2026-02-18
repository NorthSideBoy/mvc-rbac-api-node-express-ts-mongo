import mongoose from "mongoose";
import { logger } from "../utils/logger.util";
import { env } from "./env.config";

export const Database = {
	async connect(): Promise<void> {
		try {
			await mongoose.connect(env.DB.URL, { writeConcern: { w: "majority" } });

			logger.info(
				{ host: env.DB.HOST, port: env.DB.PORT, db: env.DB.NAME },
				"[MongoDB] connected",
			);
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
