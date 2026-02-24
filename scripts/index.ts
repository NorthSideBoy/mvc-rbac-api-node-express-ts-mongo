import { setTimeout } from "node:timers/promises";
import { ZodError } from "zod";
import { bootstrap, shutdown } from "../src/bootstrap";
import { context } from "../src/context/context.handler";
import ExecutionContext from "../src/context/execution-context";
import { logger } from "../src/utils/logger.util";
import CreateUser from "./create-user.script";
import type Script from "./script";
import Test from "./test.script";

type ScriptFactory = () => Script;

const scripts: Record<string, ScriptFactory> = {
	test: () => new Test(),
	"create-user": () => new CreateUser(),
};

function find(name: string): Script | undefined {
	const factory = scripts[name];
	return factory ? factory() : undefined;
}

function list(): void {
	logger.info("Available scripts:");

	for (const [name, factory] of Object.entries(scripts)) {
		const temp = factory();
		logger.info(`- ${name}: ${temp.description}`);
	}
}

async function main(): Promise<void> {
	const name = process.argv[2];
	try {
		if (!name || name === "-h" || name === "--help") {
			list();
			process.exitCode = name ? 0 : 1;
			return;
		}

		const script = find(name);

		if (!script) {
			logger.error(`Script "${name}" not found`);
			list();
			process.exitCode = 1;
			return;
		}

		await bootstrap();
		logger.info(`[Script] running: ${name}`);

		const ctx = ExecutionContext.system();

		await new Promise<void>((resolve, reject) => {
			context.run(ctx, async () => {
				try {
					await setTimeout();
					await script.run();
					resolve();
				} catch (error) {
					reject(error);
				}
			});
		});

		logger.info(`[Script] ${name} success`);

		await shutdown();
		process.exit(0);
	} catch (error) {
		if (error instanceof ZodError) {
			error.message = error.issues
				.map((i) =>
					i.path.length > 0
						? `${i.path.join(".")}: ${i.message}`
						: `${i.message}`,
				)
				.join("; ");
		}
		logger.error(
			{ error },
			`[Script] ${name} ${error instanceof Error ? error.name : "UnexpectedError"}`,
		);
		process.exit(1);
	}
}

main();
