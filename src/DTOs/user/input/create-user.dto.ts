import type { Role } from "../../../enums/role.enum";

export default class CreateUser {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	role: Role;
	password: string;
	birthday: Date;
	enable?: boolean;
	picture?: File;
}
