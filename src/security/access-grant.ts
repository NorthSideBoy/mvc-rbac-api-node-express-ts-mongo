import UnauthorizedError from "../errors/http/unauthorized.error";
import type { Role } from "../rbac/role";
import RolePolicy from "../rbac/role-policy";
import type { AccessClaims } from "./access-claims";
import { UserActor } from "./actor";

export class AccessGrant {
	private constructor(public readonly claims: AccessClaims) {}

	static issue(
		claims: AccessClaims,
		allowedRoles: ReadonlyArray<Role>,
	): AccessGrant {
		if (!claims.isEnabled()) throw new UnauthorizedError("User is disabled");
		const policy = RolePolicy.create();
		if (!policy.canAccess(claims.role, allowedRoles))
			throw new UnauthorizedError("Insufficient permissions");
		return new AccessGrant(claims);
	}

	toActor(): UserActor {
		return UserActor.fromClaims(this.claims);
	}
}
