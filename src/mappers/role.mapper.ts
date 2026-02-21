import { Role, UpdateRole } from "../enums/role.enum";
import { Role as RBACRole } from "../rbac/role";

export function roleToRBACRole(role: RBACRole): Role {
	switch (role) {
		case RBACRole.ADMIN:
			return Role.ADMIN;
		case RBACRole.MANAGER:
			return Role.MANAGER;
		case RBACRole.USER:
			return Role.USER;
		default:
			throw new TypeError(`Unknown role: ${role}`);
	}
}

export function RBACRoleToRole(role: Role): RBACRole {
	switch (role) {
		case Role.ADMIN:
			return RBACRole.ADMIN;
		case Role.MANAGER:
			return RBACRole.MANAGER;
		case Role.USER:
			return RBACRole.USER;
		default:
			throw new TypeError(`Unknown role: ${role}`);
	}
}

export function updateRoleToRole(role: UpdateRole): Role {
	switch (role) {
		case UpdateRole.MANAGER:
			return Role.MANAGER;
		case UpdateRole.USER:
			return Role.USER;
		default:
			throw new TypeError(`Unknown role: ${role}`);
	}
}
