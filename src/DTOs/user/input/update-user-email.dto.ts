import type { User } from "../../../types/user.type";

type UpdateUserEmailType = Pick<User.Create, "email">;

export class UpdateUserEmail {
	email: string;
}

const _typeCheck: UpdateUserEmailType = {} as UpdateUserEmail;
