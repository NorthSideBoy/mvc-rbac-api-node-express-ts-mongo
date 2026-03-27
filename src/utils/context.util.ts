import { AsyncLocalStorage } from "node:async_hooks";
import ExecutionContext from "../context/execution-context";

const storage = new AsyncLocalStorage<ExecutionContext>();

export const context = {
	get(): ExecutionContext {
		return storage.getStore() ?? ExecutionContext.anonymous();
	},

	run<T>(context: ExecutionContext, fn: () => T): T {
		return storage.run(context, fn);
	},

	async runAsync<T>(
		context: ExecutionContext,
		fn: () => Promise<T>,
	): Promise<T> {
		return await storage.run(context, fn);
	},

	set(context: ExecutionContext): void {
		storage.enterWith(context);
	},
};
