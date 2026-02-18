import type { Role } from "../../../rbac/role";
import type { User } from "../../../types/user.type";

type Type = User.Secure & { token: string };

export class AuthenticatedUser {
	id: string;
	firstname: string;
	lastname: string;
	username: string;
	role: Role;
	email: string;
	birthday: Date;
	enable: boolean;
	createdAt: Date;
	updatedAt: Date;
	token: string;
}

const _typeCheck: Type = {} as AuthenticatedUser;
