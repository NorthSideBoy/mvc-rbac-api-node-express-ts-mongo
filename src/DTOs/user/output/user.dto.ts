import type { Role } from "../../../rbac/role";
import type { User as Types } from "../../../types/user.type";

type UserType = Types.Secure;

export class User {
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
}

const _typeCheck: UserType = {} as User;
