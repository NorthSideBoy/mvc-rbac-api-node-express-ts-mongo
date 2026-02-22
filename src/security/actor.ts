import { type IActor, Kind } from "../contracts/actor.contract";
import { Role } from "../rbac/enums/role.enum";
import { default as RBACActor } from "../rbac/models/actor.model";
import type { AccessClaims } from "./access-claims";
export class UserActor extends RBACActor implements IActor {
	readonly kind = Kind.USER;

	private constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly role: Role,
		public readonly enable: boolean,
		public readonly issuedAt: number,
		public readonly expiresAt: number,
	) {
		super(id, role);
	}

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

	isActive(): boolean {
		const now = Date.now();
		return this.enable && now >= this.issuedAt && now <= this.expiresAt;
	}
}

export class AnonymousActor extends RBACActor implements IActor {
	readonly kind = Kind.ANONYMOUS;
	readonly username = "anonymous";
	readonly enable = true;
	readonly sessionId: string;

	constructor(sessionId?: string) {
		const id = sessionId || crypto.randomUUID();
		super(id, Role.ANONYMOUS);
		this.sessionId = id;
	}
}

export class SystemActor extends RBACActor implements IActor {
	readonly kind = Kind.SYSTEM;
	readonly username = "system";
	readonly enable = true;

	private static instance: SystemActor;

	constructor() {
		const id = process.pid.toString();
		super(id, Role.JOKER);
	}

	static getInstance(): SystemActor {
		if (!SystemActor.instance) SystemActor.instance = new SystemActor();

		return SystemActor.instance;
	}
}
