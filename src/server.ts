import "reflect-metadata";
import { createServer } from "node:http";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";
import { instrument } from "@socket.io/admin-ui";
import cors from "cors";
import express from "express";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { pinoHttp } from "pino-http";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { buildSchema } from "type-graphql";
import { formatGraphQLError } from "./api/graphql/middlewares/error.middleware";
import AuthResolver from "./api/graphql/resolvers/auth.resolver";
import UserResolver from "./api/graphql/resolvers/user.resolver";
import type { GraphQLContext } from "./api/graphql/types/graphql-context.type";
import swaggerDocument from "./api/rest/docs/swagger.json";
import { expressAuthentication } from "./api/rest/middlewares/auth.middleware";
import { errorMiddleware } from "./api/rest/middlewares/error.middleware";
import { generalLimiter } from "./api/rest/middlewares/rate-limiter.middleware";
import { RegisterRoutes } from "./api/rest/routes/routes";
import { bridges } from "./api/socket.io/bridges";
import { gateways } from "./api/socket.io/gateways";
import { bootstrap, shutdown } from "./bootstrap";
import { config } from "./configs/env.config";
import { Role } from "./enums/role.enum";
import { logger } from "./utils/logger.util";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: config.cors.origin,
		methods: ["GET", "POST"],
		credentials: config.server.isProduction,
	},
});
instrument(io, {
	auth: {
		type: "basic",
		username: config.socketAdmin.username,
		password: config.socketAdmin.password,
	},
	mode: config.server.nodeEnv,
	namespaceName: "/admin",
});

const maxFileSize = config.file.max_size * 1024 * 1024;

app.use(
	config.server.isProduction
		? pinoHttp({ logger: logger.raw, level: config.server.logLevel })
		: (_req, _res, next) => next(),
);
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));
app.use(generalLimiter);

app.use("/public", express.static("storage/public"));
app.use(
	"/private",
	async (req, _res, next) => {
		await expressAuthentication(req, "Bearer", [Role.ADMIN]);
		next();
	},
	express.static("storage/private"),
);

app.use(
	"/socket-ui",
	express.static(
		path.resolve("node_modules", "@socket.io", "admin-ui", "ui", "dist"),
	),
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/swagger.json", (_request, response) => {
	response.json(swaggerDocument);
});

RegisterRoutes(app);
app.use(errorMiddleware);

const start = async (): Promise<void> => {
	await bootstrap();
	bridges.initialize(io);
	gateways.initialize(io);

	io.on("connection", (socket) => {
		logger.info({ socket_id: socket.id }, "[Socket.IO] client connected");
		gateways.register(socket);

		socket.on("disconnect", (reason) => {
			logger.info(
				{ socket_id: socket.id, reason },
				"[Socket.IO] client disconnected",
			);
		});
	});

	const schema = await buildSchema({
		resolvers: [AuthResolver, UserResolver],
	});

	const apollo = new ApolloServer<GraphQLContext>({
		schema,
		plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false })],
		formatError: formatGraphQLError,
	});

	await apollo.start();

	app.use(
		"/graphql",
		graphqlUploadExpress({ maxFileSize }),
		expressMiddleware(apollo, {
			context: async ({ req, res }): Promise<GraphQLContext> => {
				return { req, res };
			},
		}),
	);

	server.listen(config.server.port, config.server.host, () => {
		logger.info(
			{
				host: config.server.host,
				port: config.server.port,
				cors: config.cors.origin,
			},
			"[HTTP] listening",
		);
		logger.info(`Swagger docs available at: ${config.server.publicUrl}/docs`);
		logger.info(
			`GraphQL sandbox available at: ${config.server.publicUrl}/graphql`,
		);
		logger.info(
			`Socket.io admin-ui available at: ${config.server.publicUrl}/socket-ui`,
		);
	});

	const gracefulShutdown = async (): Promise<void> => {
		logger.info("[HTTP] shutting down");
		logger.info("[Socket.IO] shutting down");
		gateways.shutdown();
		bridges.shutdown();

		io.close(() => {
			server.close(async () => {
				await apollo.stop();
				await shutdown();
				process.exit(0);
			});
		});
	};

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
};

start().catch((error) => {
	logger.error("Failed to start server:", error);
	process.exit(1);
});
