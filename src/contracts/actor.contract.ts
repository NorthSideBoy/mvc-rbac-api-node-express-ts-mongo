import type { IActor as ActorLike } from "../rbac/contracts";
import type { Action } from "../rbac/permissions";
import type { Role } from "../rbac/role";

export enum Kind {
	USER = "USER",
	ANONYMOUS = "ANONYMOUS",
	SYSTEM = "SYSTEM",
}

export interface IActor {
	readonly kind: Kind;
	readonly id: string;
	readonly username: string;
	readonly role: Role;
	readonly enable: boolean;
	readonly issuedAt?: number;
	readonly expiresAt?: number;
	can(action: Action): boolean;
	canManage(action: Action, target: ActorLike): boolean;
	canAssign(targetRole: Role): boolean;
	canAccess(allowed: ReadonlyArray<Role>): boolean;
}
