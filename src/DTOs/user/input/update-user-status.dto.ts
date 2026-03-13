import type { CreateUser } from "./create-user.dto";

export type UpdateUserStatus = Required<Pick<CreateUser, "enable">>;
