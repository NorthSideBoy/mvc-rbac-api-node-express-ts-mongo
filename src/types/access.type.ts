import type { Role } from "../enums/role.enum";
import type { Token } from "./token.type";
export namespace Access {
	export type Claims = {
		subject: string;
		username: string;
		role: Role;
		enable: boolean;
		issuedAt: number;
		expiresAt: number;
		raw: Token.Payload;
	};

	export type Grant = Claims;
}
