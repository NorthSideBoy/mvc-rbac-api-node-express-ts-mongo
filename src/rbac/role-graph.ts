import type { IEdge } from "./contracts";
import type { Permission } from "./permissions";
import { Role } from "./role";
import { ROLE_DEFINITIONS } from "./role-definitions";

export default class RoleGraph {
	private constructor(private readonly graph: Map<Role, IEdge>) {}

	static create(): RoleGraph {
		const graph = new Map<Role, IEdge>();

		ROLE_DEFINITIONS.forEach(({ name, includes = [], permissions = [] }) => {
			graph.set(name, {
				includes: new Set(includes),
				permissions: new Set(permissions as Permission[]),
			});
		});

		Object.values(Role).forEach((role) => {
			if (!graph.has(role)) {
				graph.set(role, { includes: new Set(), permissions: new Set() });
			}
		});

		return new RoleGraph(graph);
	}

	private resolveRoles(role: Role, visited = new Set<Role>()): Set<Role> {
		if (visited.has(role)) return visited;
		visited.add(role);

		const edge = this.graph.get(role);
		edge?.includes.forEach((included) => {
			this.resolveRoles(included, visited);
		});

		return visited;
	}

	private resolvePermissions(role: Role): Set<Permission> {
		const roles = this.resolveRoles(role);
		const permissions = new Set<Permission>();

		roles.forEach((r) => {
			this.graph.get(r)?.permissions.forEach((p) => {
				permissions.add(p);
			});
		});

		return permissions;
	}

	getAllRoles = (): Role[] => Array.from(this.graph.keys());

	hasRole = (role: Role): boolean => this.graph.has(role);

	getDirectChildren = (role: Role): Role[] =>
		Array.from(this.graph.get(role)?.includes ?? []);

	getDirectParents = (role: Role): Role[] =>
		Array.from(this.graph.entries())
			.filter(([_, edge]) => edge.includes.has(role))
			.map(([parent]) => parent);

	includesRole = (role: Role, target: Role): boolean =>
		this.resolveRoles(role).has(target);

	getAllIncludedRoles = (role: Role): Role[] =>
		Array.from(this.resolveRoles(role));

	getParentRoles = (role: Role): Role[] =>
		Array.from(this.graph.keys()).filter(
			(p) => p !== role && this.includesRole(p, role),
		);

	hasPermission = (role: Role, permission: Permission): boolean =>
		this.resolvePermissions(role).has(permission);

	getAllPermissions = (role: Role): Permission[] =>
		Array.from(this.resolvePermissions(role));

	getDepth(role: Role, memo = new Map<Role, number>()): number {
		const cached = memo.get(role);
		if (cached !== undefined) return cached;

		const parents = this.getParentRoles(role);
		if (parents.length === 0) return 0;

		const depth = 1 + Math.max(...parents.map((p) => this.getDepth(p, memo)));
		memo.set(role, depth);
		return depth;
	}
}
