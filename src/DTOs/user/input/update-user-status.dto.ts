import type { User } from "../../../types/user.type";

type UpdateUserStatusType = Pick<User.Create, "enable">;

export class UpdateUserStatus {
	enable: boolean;
}

const _typeCheck: UpdateUserStatusType = {} as UpdateUserStatus;
