import { PERMISSIONS } from "../constants/permissions.constant";
import type { IActor } from "../contracts/actor.contract";
import type { IPermission } from "../contracts/permission.contract";
import type { Role } from "../enums/role.enum";
import type { Operation } from "../types/operation.type";
import type { Permission } from "../types/permission.type";
import type { Scope } from "../types/scope.type";
import RoleGraph from "./role-graph";

export default class RolePolicy {
	private readonly graph: RoleGraph;
	private readonly operationScopeCache: Map<Role, Map<Operation, Scope[]>>;

	private constructor(graph: RoleGraph) {
		this.graph = graph;
		this.operationScopeCache = new Map();
	}

	static create(): RolePolicy {
		return new RolePolicy(RoleGraph.create());
	}

	canAccess(role: Role, allowedRoles: ReadonlyArray<Role>): boolean {
		return allowedRoles.some((allowed) =>
			this.graph.includesRole(role, allowed),
		);
	}

	private parsePermission(permission: Permission): IPermission {
		const parts = permission.split(":");
		return {
			operation: `${parts[0]}:${parts[1]}` as Operation,
			scope: (parts[2] as Scope) || null,
		};
	}

	private getOperationScopeMapForRole(role: Role): Map<Operation, Scope[]> {
		let map = this.operationScopeCache.get(role);
		if (map) return map;

		const permissions = this.graph.getAllPermissions(role);
		map = new Map<Operation, Scope[]>();

		for (const perm of permissions) {
			if (perm === PERMISSIONS.WILDCARD) continue;
			const { operation, scope } = this.parsePermission(perm);
			const scopes = map.get(operation) || [];
			if (scope && !scopes.includes(scope)) {
				scopes.push(scope);
			} else if (!scope && !scopes.includes(null)) {
				scopes.push(null);
			}
			map.set(operation, scopes);
		}

		this.operationScopeCache.set(role, map);
		return map;
	}

	private canPerform(
		actor: IActor,
		operation: Operation,
		target?: IActor,
	): boolean {
		if (this.graph.hasPermission(actor.role, PERMISSIONS.WILDCARD)) {
			return true;
		}

		const operationScopes = this.getOperationScopeMapForRole(actor.role).get(
			operation,
		);
		if (!operationScopes) return false;

		for (const scope of operationScopes) {
			switch (scope) {
				case null:
					return true;
				case "all":
					if (target && this.graph.includesRole(actor.role, target.role))
						return true;
					break;
				case "managed":
					if (
						target &&
						actor.role !== target.role &&
						this.graph.includesRole(actor.role, target.role)
					) {
						return true;
					}
					break;
				case "own":
					if (target && actor.id === target.id) return true;
					break;
			}
		}
		return false;
	}

	can(actor: IActor, operation: Operation): boolean {
		return this.canPerform(actor, operation);
	}

	canManage(actor: IActor, operation: Operation, target: IActor): boolean {
		return this.canPerform(actor, operation, target);
	}

	canAssign(assignerRole: Role, targetRole: Role): boolean {
		return (
			this.graph.hasPermission(assignerRole, PERMISSIONS.WILDCARD) ||
			(assignerRole !== targetRole &&
				this.graph.includesRole(assignerRole, targetRole))
		);
	}

	filterByPermission<T extends IActor>(
		actor: IActor,
		operation: Operation,
		items: T[],
	): T[] {
		return items.filter((item) => this.canPerform(actor, operation, item));
	}

	includes(role: Role, target: Role): boolean {
		return this.graph.includesRole(role, target);
	}

	getIncluded(role: Role): Role[] {
		return this.graph.getAllIncludedRoles(role);
	}

	getParents(role: Role): Role[] {
		return this.graph.getDirectParents(role);
	}

	getChildren(role: Role): Role[] {
		return this.graph.getDirectChildren(role);
	}

	getAll(): Role[] {
		return this.graph.getAllRoles();
	}

	exists(role: Role): boolean {
		return this.graph.hasRole(role);
	}

	depth(role: Role): number {
		return this.graph.getDepth(role);
	}

	roots(): Role[] {
		return this.getAll().filter((r) => this.getParents(r).length === 0);
	}

	hasPermission(role: Role, permission: Permission): boolean {
		return this.graph.hasPermission(role, permission);
	}

	getPermissions(role: Role): Permission[] {
		return this.graph.getAllPermissions(role);
	}

	canManageRole(actor: Role, target: Role): boolean {
		return this.canAssign(actor, target);
	}
}
