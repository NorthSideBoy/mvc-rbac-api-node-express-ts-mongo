import type { IActor, IPermission } from "./contracts";
import { type Action, PERMISSIONS, type Permission } from "./permissions";
import type { Role } from "./role";
import RoleGraph from "./role-graph";

export type Scope = "own" | "managed" | "all" | null;
export default class RolePolicy {
	private constructor(private readonly graph: RoleGraph) {}

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
			action: `${parts[0]}:${parts[1]}` as Action,
			scope: (parts[2] as Scope) || null,
		};
	}

	private getPermissionsForRole(role: Role): Map<Action, Scope[]> {
		const permissions = this.graph.getAllPermissions(role);
		const map = new Map<Action, Scope[]>();

		permissions.forEach((perm) => {
			const { action, scope } = this.parsePermission(perm);
			const scopes = map.get(action) || [];
			if (scope && !scopes.includes(scope)) scopes.push(scope);
			if (!scope && !scopes.includes(null)) scopes.push(null);
			map.set(action, scopes);
		});

		return map;
	}

	canPerform(actor: IActor, action: Action, target?: IActor): boolean {
		const allPermissions = this.graph.getAllPermissions(actor.role);
		if (allPermissions.includes(PERMISSIONS.WILDCARD)) return true;

		const permissions = this.getPermissionsForRole(actor.role);
		const scopes = permissions.get(action);

		if (!scopes) return false;

		for (const scope of scopes) {
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
					)
						return true;
					break;
				case "own":
					if (target && actor.id === target.id) return true;
					break;
				default:
					break;
			}
		}

		return false;
	}

	can(actor: IActor, action: Action): boolean {
		return this.canPerform(actor, action);
	}

	canManage(actor: IActor, action: Action, target: IActor): boolean {
		return this.canPerform(actor, action, target);
	}

	canAssign(assignerRole: Role, targetRole: Role) {
		return (
			assignerRole !== targetRole &&
			this.graph.includesRole(assignerRole, targetRole)
		);
	}

	filterByPermission<T extends IActor>(
		actor: IActor,
		action: Action,
		items: T[],
	): T[] {
		return items.filter((item) => this.canPerform(actor, action, item));
	}

	includes = (role: Role, target: Role): boolean =>
		this.graph.includesRole(role, target);

	getIncluded = (role: Role): Role[] => this.graph.getAllIncludedRoles(role);

	getParents = (role: Role): Role[] => this.graph.getDirectParents(role);

	getChildren = (role: Role): Role[] => this.graph.getDirectChildren(role);

	getAll = (): Role[] => this.graph.getAllRoles();

	exists = (role: Role): boolean => this.graph.hasRole(role);

	depth = (role: Role): number => this.graph.getDepth(role);

	roots = (): Role[] =>
		this.getAll().filter((r) => this.getParents(r).length === 0);

	hasPermission = (role: Role, permission: Permission): boolean =>
		this.graph.hasPermission(role, permission);

	getPermissions = (role: Role): Permission[] =>
		this.graph.getAllPermissions(role);

	canManageRole = (actor: Role, target: Role): boolean =>
		actor !== target && this.graph.includesRole(actor, target);
}
