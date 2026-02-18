import type { User } from "../../../types/user.type";

type Type = Omit<User.Create, "role">;

export class RegisterUser {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	password: string;
	birthday: Date;
	enable: boolean;
}

const _typeCheck: Type = {} as RegisterUser;
