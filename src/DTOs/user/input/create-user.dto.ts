import type { Role } from "../../../enums/role.enum";
import type { User } from "../../../types/user.type";

type CreateUserType = User.Create;

export class CreateUser {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	role: Role;
	password: string;
	birthday: Date;
	enable: boolean;
}

const _typeCheck: CreateUserType = {} as CreateUser;
