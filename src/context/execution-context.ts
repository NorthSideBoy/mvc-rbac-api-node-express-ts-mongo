import type { IActor } from "../contracts/actor.contract";
import type { AccessGrant } from "../security/access-grant";
import { AnonymousActor, SystemActor } from "../security/actor";

export class ExecutionContext {
	private constructor(readonly actor: IActor) {}

	static fromGrant(grant: AccessGrant): ExecutionContext {
		return new ExecutionContext(grant.actor);
	}

	static anonymous(): ExecutionContext {
		return new ExecutionContext(new AnonymousActor());
	}

	static system(): ExecutionContext {
		return new ExecutionContext(new SystemActor());
	}
}
