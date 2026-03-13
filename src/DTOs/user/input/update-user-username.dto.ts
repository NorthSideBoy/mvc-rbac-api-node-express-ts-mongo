import type { CreateUser } from "./create-user.dto";

export type UpdateUserUsername = Required<Pick<CreateUser, "username">>;
