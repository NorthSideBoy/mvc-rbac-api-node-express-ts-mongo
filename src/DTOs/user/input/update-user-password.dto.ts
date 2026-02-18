import type { User } from "../../../types/user.type";

type Type = Pick<User.Create, "password">;

export class UpdateUserPassword {
	password: string;
}

const _typeCheck: Type = {} as UpdateUserPassword;
