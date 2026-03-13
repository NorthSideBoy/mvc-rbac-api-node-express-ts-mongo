import type { IActor as IActorLike } from "../rbac/contracts/actor.contract";
import type { Role } from "../rbac/enums/role.enum";
import type { Operation } from "../rbac/types/operation.type";

export enum Kind {
	USER = "USER",
	ANONYMOUS = "ANONYMOUS",
	SYSTEM = "SYSTEM",
}

export interface IActor extends IActorLike {
	readonly kind: Kind;
	readonly username: string;
	readonly enable: boolean;
	readonly issuedAt?: number;
	readonly expiresAt?: number;
	can(operation: Operation): boolean;
	canManage(operation: Operation, target: IActorLike): boolean;
	canAssign(targetRole: Role): boolean;
	canAccess(allowed: ReadonlyArray<Role>): boolean;
}
