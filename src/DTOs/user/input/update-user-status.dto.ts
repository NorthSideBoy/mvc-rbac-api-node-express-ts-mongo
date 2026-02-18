import type { User } from "../../../types/user.type";

type Type = Pick<User.Create, "enable">;

export class UpdateUserStatus {
	enable: boolean;
}

const _typeCheck: Type = {} as UpdateUserStatus;
