import type { CreateUser } from "./create-user.dto";

export type UpdateUserProfile = Partial<
	Pick<CreateUser, "firstname" | "lastname" | "birthday">
>;
