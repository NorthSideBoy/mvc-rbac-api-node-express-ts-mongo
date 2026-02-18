import type { User } from "../../../types/user.type";

type Type = Pick<User.Create, "username">;

export class UpdateUserUsername {
	username: string;
}

const _typeCheck: Type = {} as UpdateUserUsername;
