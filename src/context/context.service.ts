import { AsyncLocalStorage } from "node:async_hooks";
import { ExecutionContext } from "./execution-context";

const storage = new AsyncLocalStorage<ExecutionContext>();

export const context = {
	get(): ExecutionContext {
		return storage.getStore() ?? ExecutionContext.anonymous();
	},

	run(context: ExecutionContext, fn: () => void): void {
		storage.run(context, fn);
	},

	set(context: ExecutionContext): void {
		storage.enterWith(context);
	}
};