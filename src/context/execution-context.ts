import { AsyncLocalStorage } from "node:async_hooks";
import type { IActor } from "../contracts/actor.contract";
import type { AccessGrant } from "../security/access-grant";
import { AnonymousActor } from "../security/actor";

const storage = new AsyncLocalStorage<ExecutionContext>();

export class ExecutionContext {
	private constructor(readonly actor: IActor) {}

	static createFromGrant(grant: AccessGrant): ExecutionContext {
		return new ExecutionContext(grant.actor);
	}

	static createAnonymous(): ExecutionContext {
		return new ExecutionContext(new AnonymousActor());
	}

	static current(): ExecutionContext {
		return storage.getStore() ?? ExecutionContext.createAnonymous();
	}

	static enterWithGrant(grant: AccessGrant): ExecutionContext {
		const ctx = ExecutionContext.createFromGrant(grant);
		storage.enterWith(ctx);
		return ctx;
	}

	static runWithGrant<T>(grant: AccessGrant, fn: () => T): T {
		const ctx = ExecutionContext.createFromGrant(grant);
		return storage.run(ctx, fn);
	}
}
