import type { User } from "../../../types/user.type";

type LoginUserType = Pick<User.Schema, "email" | "password">;

export class LoginUser {
	email: string;
	password: string;
}

const _typeCheck: LoginUserType = {} as LoginUser;
