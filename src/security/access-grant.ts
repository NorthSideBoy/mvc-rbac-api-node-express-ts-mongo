import type { Role } from "../enums/role.enum";
import UnauthorizedError from "../errors/http/unauthorized.error";
import type { AccessClaims } from "./access-claims";
import type { UserActor } from "./actor";

export class AccessGrant {
	private constructor(public readonly claims: AccessClaims) {}

	static issue(
		claims: AccessClaims,
		allowedRoles: ReadonlyArray<Role>,
	): AccessGrant {
		if (!claims.isEnabled()) throw new UnauthorizedError("User is disabled");
		if (!claims.actor.canAccess(allowedRoles))
			throw new UnauthorizedError("Insufficient permissions");
		return new AccessGrant(claims);
	}

	get actor(): UserActor {
		return this.claims.actor;
	}
}
