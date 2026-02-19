import type { Role } from "../rbac/role";
import type { AccessClaims } from "./access-claims";
import { kind } from "./kind";

export interface Actor {
	readonly kind: kind;
	readonly id: string;
	readonly username: string;
	readonly role?: Role;
	readonly enable: boolean;
	readonly issuedAt?: number;
	readonly expiresAt?: number;
}

export class UserActor implements Actor {
	readonly kind = kind.USER;

	private constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly role: Role,
		public readonly enable: boolean,
		public readonly issuedAt: number,
		public readonly expiresAt: number,
	) {}

	static fromClaims(claims: AccessClaims): UserActor {
		return new UserActor(
			claims.subject,
			claims.username,
			claims.role,
			claims.enable,
			claims.issuedAt,
			claims.expiresAt,
		);
	}
}

export class AnonymousActor implements Actor {
	readonly kind = kind.ANONYMOUS;
	readonly id = process.pid.toString();
	readonly username = "anonymous";
	readonly enable = true;

	private static INSTANCE: AnonymousActor;

	private constructor() {}

	static instance(): AnonymousActor {
		if (!AnonymousActor.INSTANCE)
			AnonymousActor.INSTANCE = new AnonymousActor();
		return AnonymousActor.INSTANCE;
	}
}

export class SystemActor implements Actor {
	readonly kind = kind.SYSTEM;
	readonly id = process.pid.toString();
	readonly username = "system";
	readonly enable = true;

	private static INSTANCE: SystemActor;

	private constructor() {}

	static instance(): SystemActor {
		if (!SystemActor.INSTANCE) SystemActor.INSTANCE = new SystemActor();
		return SystemActor.INSTANCE;
	}
}
