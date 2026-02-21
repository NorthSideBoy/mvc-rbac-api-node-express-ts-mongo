import type { Action, Permission } from "./permissions";
import type { Role } from "./role";
import type { Scope } from "./role-policy";

export interface IActor {
	id: string;
	role: Role;
}

export interface IRole {
	name: Role;
	includes?: Role[];
	permissions: readonly string[];
}

export interface IEdge {
	includes: Set<Role>;
	permissions: Set<Permission>;
}

export interface IPermission {
	action: Action;
	scope: Scope;
}
