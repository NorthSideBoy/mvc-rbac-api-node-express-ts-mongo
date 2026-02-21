import type { Role } from "../enums/role.enum";
import type { Access } from "../types/access.type";
import type { Token } from "../types/token.type";
import { UserActor } from "./actor";

export class AccessClaims {
	private constructor(private readonly params: Access.Claims) {}

	get subject(): string {
		return this.params.subject;
	}

	get username(): string {
		return this.params.username;
	}

	get role(): Role {
		return this.params.role;
	}

	get enable(): boolean {
		return this.params.enable;
	}

	get issuedAt(): number {
		return this.params.issuedAt;
	}

	get expiresAt(): number {
		return this.params.expiresAt;
	}

	get raw(): Token.Payload {
		return this.params.raw;
	}

	get actor(): UserActor {
		return UserActor.fromClaims(this);
	}

	static fromPayload(payload: Token.Payload): AccessClaims {
		return new AccessClaims({
			...payload,
			subject: payload.sub,
			issuedAt: payload.iat,
			expiresAt: payload.exp,
			enable: payload.enable,
			raw: payload,
		});
	}

	isEnabled(): boolean {
		return this.enable === true;
	}
}
