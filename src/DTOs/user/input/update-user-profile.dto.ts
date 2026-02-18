import type { User } from "../../../types/user.type";

type Type = Partial<Pick<User.Create, "firstname" | "lastname" | "birthday">>;

export class UpdateUserProfile {
	firstname: string;
	lastname: string;
	birthday: Date;
}

const _typeCheck: Type = {} as UpdateUserProfile;
