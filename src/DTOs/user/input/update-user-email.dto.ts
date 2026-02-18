import type { User } from "../../../types/user.type";

type Type = Pick<User.Create, "email">;

export class UpdateUserEmail {
	email: string;
}

const _typeCheck: Type = {} as UpdateUserEmail;
