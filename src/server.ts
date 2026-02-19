import "reflect-metadata";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { bootstrap, shutdown } from "./bootstrap";
import { env } from "./configs/env.config";
import swaggerDocument from "./docs/swagger.json";
import { errorMiddleware } from "./middlewares/error.middleware";
import { RegisterRoutes } from "./routes/routes";
import { logger } from "./utils/logger.util";

const app = express();

// app.use(
// 	pinoHttp({
// 		logger: logger.raw,
// 	}),
// );
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/swagger.json", (_request, response) => {
	response.json(swaggerDocument);
});

RegisterRoutes(app);

app.use(errorMiddleware);

const startServer = async (): Promise<void> => {
	await bootstrap();

	const server = app.listen(env.PORT, env.HOST, () => {
		logger.info(
			{ host: env.HOST, port: env.PORT, mode: env.NODE_ENV },
			"[HTTP] listening",
		);
		logger.info(
			`Swagger docs available at http://${env.HOST}:${env.PORT}/docs`,
		);
	});

	const gracefulShutdown = async (): Promise<void> => {
		logger.info("[HTTP] shutting down");
		server.close(async () => {
			await shutdown();
			process.exit(0);
		});
	};

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
};

void startServer();
