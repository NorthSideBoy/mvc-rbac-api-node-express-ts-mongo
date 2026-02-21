import type { IActor } from "./contracts";
import type { Action } from "./permissions";
import type { Role } from "./role";
import RolePolicy from "./role-policy";

export class Actor implements IActor {
	constructor(
		public readonly id: string,
		public readonly role: Role,
		private readonly policy: RolePolicy = RolePolicy.create(),
	) {}

	static dummy(role: Role): IActor {
		return new Actor("dummy", role);
	}

	can(action: Action): boolean {
		return this.policy.can(this, action);
	}

	canManage(action: Action, target: IActor): boolean {
		return this.policy.canManage(this, action, target);
	}

	canAssign(targetRole: Role): boolean {
		return this.policy.canAssign(this.role, targetRole);
	}

	canAccess(allowedRoles: ReadonlyArray<Role>): boolean {
		return this.policy.canAccess(this.role, allowedRoles);
	}
}
