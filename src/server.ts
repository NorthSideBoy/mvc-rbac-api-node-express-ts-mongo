import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { buildSchema } from "type-graphql";
import { bootstrap, shutdown } from "./bootstrap";
import { env } from "./configs/env.config";
import swaggerDocument from "./docs/swagger.json";
import { formatGraphQLError } from "./middlewares/graphql/error.middleware";
import { errorMiddleware } from "./middlewares/rest/error.middleware";
import { generalLimiter } from "./middlewares/rest/rate-limiter.middleware";
import UserResolver from "./resolvers/user.resolver";
import { RegisterRoutes } from "./routes/routes";
import type { GraphQLContext } from "./types/graphql-context.type";
import { logger } from "./utils/logger.util";

const app = express();

app.use(
	env.NODE_ENV === "production"
		? pinoHttp({ logger: logger.raw, level: env.LOG_LEVEL })
		: (_req, _res, next) => next(),
);
app.use(cors({ origin: env.CORS.ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/swagger.json", (_request, response) => {
	response.json(swaggerDocument);
});

RegisterRoutes(app);

app.use(errorMiddleware);

const start = async (): Promise<void> => {
	await bootstrap();

	const schema = await buildSchema({
		resolvers: [UserResolver],
		validate: false,
	});

	const apollo = new ApolloServer<GraphQLContext>({
		formatError: formatGraphQLError,
		schema,
		plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false })],
	});

	await apollo.start();

	app.use(
		"/graphql",
		cors<cors.CorsRequest>({ origin: env.CORS.ORIGIN }),
		express.json(),
		expressMiddleware(apollo, {
			context: async ({ req, res }): Promise<GraphQLContext> => {
				return { req, res };
			},
		}),
	);

	const server = app.listen(env.PORT, env.HOST, () => {
		logger.info(
			{ host: env.HOST, port: env.PORT, cors: env.CORS.ORIGIN },
			"[HTTP] listening",
		);
		logger.info(
			`Swagger docs available at http://${env.HOST}:${env.PORT}/docs`,
		);
		logger.info(
			`GraphQL Playground available at http://${env.HOST}:${env.PORT}/graphql`,
		);
	});

	const gracefulShutdown = async (): Promise<void> => {
		logger.info("[HTTP] shutting down");
		server.close(async () => {
			await apollo.stop();
			await shutdown();
			process.exit(0);
		});
	};

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);
};

start().catch((error) => {
	console.log(error);
	logger.error("Failed to start server:", error);
	process.exit(1);
});
