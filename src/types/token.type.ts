import type { Role } from "../enums/role.enum";

export namespace Token {
	export type Sign = {
		sub: string;
		username: string;
		role: Role;
		enable: boolean;
	};

	export type Payload = Sign & { iat: number; exp: number };
}
