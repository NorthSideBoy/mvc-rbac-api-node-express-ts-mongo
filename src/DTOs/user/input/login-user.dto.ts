import type { User } from "../../../types/user.type";

type Type = Pick<User.Schema, "email" | "password">;

export class LoginUser {
	email: string;
	password: string;
}

const _typeCheck: Type = {} as LoginUser;
