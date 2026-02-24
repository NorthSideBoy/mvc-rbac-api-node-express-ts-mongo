import { context } from "../src/context/context.handler";
import type ExecutionContext from "../src/context/execution-context";
import { logger } from "../src/utils/logger.util";
import type Script from "./script";

export default class Test implements Script {
	readonly name = "test";
	readonly description = "Print hello world";

	get ctx(): ExecutionContext {
		return context.get();
	}

	async run(): Promise<void> {
		logger.info("Hello world");
	}
}
