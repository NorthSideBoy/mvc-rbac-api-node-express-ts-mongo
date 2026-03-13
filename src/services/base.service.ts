import { context } from "../context/context.handler";
import type ExecutionContext from "../context/execution-context";
import { PermissionDeniedError } from "../errors/authorization/permission-denied.error";
import type { IActor, Role } from "../rbac";
import type { Operation } from "../rbac/types/operation.type";

export default class BaseService {
	protected readonly ctx: ExecutionContext;
	constructor(ctx?: ExecutionContext) {
		this.ctx = ctx || context.get();
	}

	protected can(operation: Operation, message?: string) {
		if (!this.ctx.actor.can(operation))
			throw new PermissionDeniedError(message);
	}

	protected canManage(operation: Operation, target: IActor, message?: string) {
		if (!this.ctx.actor.canManage(operation, target))
			throw new PermissionDeniedError(message);
	}

	protected canAssign(role: Role, message?: string) {
		if (!this.ctx.actor.canAssign(role))
			throw new PermissionDeniedError(message);
	}
}
