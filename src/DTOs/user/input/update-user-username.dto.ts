import type { User } from "../../../types/user.type";

type UpdateUserUsernameType = Pick<User.Create, "username">;

export class UpdateUserUsername {
	username: string;
}

const _typeCheck: UpdateUserUsernameType = {} as UpdateUserUsername;
